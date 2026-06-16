"""
I-PAGe Views
=============
API views for the Impact Simulation module.
Provides CRUD for indicators, scenarios, mechanisms, and simulation runs.
"""
import math
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import (
    IPageIndicator, IPageScenario, IPageMechanism,
    IPageMechanismEffect, IPageScenarioMechanism,
    IPageSimulation, IPageSimulationMechanism, IPageSimulationResult,
)
from .ipage_serializers import (
    IPageIndicatorSerializer, IPageScenarioSerializer, IPageScenarioListSerializer,
    IPageMechanismSerializer, IPageMechanismEffectSerializer,
    IPageScenarioMechanismSerializer,
    IPageSimulationSerializer, IPageSimulationCreateSerializer,
    IPageSimulationMechanismSerializer, IPageSimulationResultSerializer,
)
from .views import get_user_project_id, ProjectFilterMixin


# ──────────────────────────────────────────────────────────────
# Read-only lookups
# ──────────────────────────────────────────────────────────────

class IPageIndicatorViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = IPageIndicator.objects.all()
    serializer_class = IPageIndicatorSerializer


class IPageMechanismViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = IPageMechanism.objects.prefetch_related('effects', 'effects__indicator').all()
    serializer_class = IPageMechanismSerializer


class IPageScenarioViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = IPageScenario.objects.prefetch_related(
        'scenario_mechanisms', 'scenario_mechanisms__mechanism'
    ).all()

    def get_serializer_class(self):
        if self.action == 'list':
            return IPageScenarioListSerializer
        return IPageScenarioSerializer


# ──────────────────────────────────────────────────────────────
# Simulation lifecycle
# ──────────────────────────────────────────────────────────────

class IPageSimulationViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = IPageSimulation.objects.prefetch_related(
        'sim_mechanisms', 'sim_mechanisms__mechanism',
        'results', 'results__indicator',
    ).all()

    def get_serializer_class(self):
        if self.action == 'create':
            return IPageSimulationCreateSerializer
        return IPageSimulationSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Execute the simulation engine and store results."""
        simulation = self.get_object()

        # ── Gather active mechanisms and their effect maps ──
        sim_mechs = simulation.sim_mechanisms.select_related('mechanism').filter(active=True)
        indicators = IPageIndicator.objects.all().order_by('order', 'id')
        indicator_ids = list(indicators.values_list('id', flat=True))

        if not sim_mechs.exists():
            return Response(
                {'error': 'No active mechanisms in this simulation.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Build the impact matrix ──
        # For each active mechanism, get its effects weighted by deployment level
        all_impacts = {ind_id: [] for ind_id in indicator_ids}
        for sm in sim_mechs:
            effects = IPageMechanismEffect.objects.filter(
                mechanism=sm.mechanism
            ).values_list('indicator_id', 'value')
            effect_map = dict(effects)

            for ind_id in indicator_ids:
                base_effect = effect_map.get(ind_id, 0.0)
                # Weight by deployment level
                weighted_effect = base_effect * sm.level
                all_impacts[ind_id].append(weighted_effect)

        # ── Compute per-indicator impact ──
        indicator_results = []
        total_impact = 0.0
        for ind_id in indicator_ids:
            values = all_impacts[ind_id]
            if values:
                avg_impact = sum(values) / len(values)
            else:
                avg_impact = 0.0
            reduction_pct = round(avg_impact * 100, 1)
            indicator_results.append({
                'indicator_id': ind_id,
                'impact_value': round(avg_impact, 4),
                'reduction_pct': reduction_pct,
            })
            total_impact += avg_impact

        matrix_average_impact = total_impact / len(indicator_ids) if indicator_ids else 0.0

        # ── Compute risk score reduction ──
        initial_score = simulation.risk_score
        score_after = max(0.0, initial_score - min(0.35, matrix_average_impact * 0.25))
        reduction_abs = round(score_after - initial_score, 4)
        reduction_rel = round((reduction_abs / initial_score) * 100, 1) if initial_score > 0 else 0.0

        # ── Risk level classification ──
        def classify_risk(score):
            if score >= 0.75:
                return 'HIGH'
            elif score >= 0.40:
                return 'MODERATE'
            return 'LOW'

        # ── Confidence calculation ──
        conf_map = {'low': 25, 'medium': 50, 'high': 75}
        base_confidence = conf_map.get(simulation.confidence, 50)
        active_count = sim_mechs.count()
        # Boost confidence by coverage and mechanism count
        coverage_boost = min(15, active_count * 3)
        confidence_score = min(95, base_confidence + coverage_boost)

        # ── Save results ──
        simulation.risk_score_after = round(score_after, 4)
        simulation.reduction_absolute = reduction_abs
        simulation.reduction_relative = reduction_rel
        simulation.confidence_score = confidence_score
        simulation.risk_level_before = classify_risk(initial_score)
        simulation.risk_level_after = classify_risk(score_after)
        simulation.computed = True
        simulation.save()

        # Clear old results and save new ones
        IPageSimulationResult.objects.filter(simulation=simulation).delete()
        for res in indicator_results:
            IPageSimulationResult.objects.create(
                simulation=simulation,
                indicator_id=res['indicator_id'],
                impact_value=res['impact_value'],
                reduction_pct=res['reduction_pct'],
            )

        # ── Build trend data ──
        horizon_months = {'6m': 6, '12m': 12, '18m': 18, '24m': 24}
        months = horizon_months.get(simulation.horizon, 12)
        steps = min(4, months // 3) if months >= 3 else 1
        before_trend = []
        after_trend = []
        for i in range(steps + 1):
            t_months = i * (months // steps) if steps > 0 else 0
            # Natural decay rate (without mitigation) ~1.5% per month
            natural_decay = i * 0.045
            # Mitigation accelerated decay
            mitigated_decay = i * 0.025
            before_trend.append({
                'label': f'{t_months} mois' if t_months > 0 else 'Initial (t0)',
                'value': round(max(0, initial_score - natural_decay), 4),
            })
            after_trend.append({
                'label': f'{t_months} mois' if t_months > 0 else 'Initial (t0)',
                'value': round(max(0, score_after - mitigated_decay), 4),
            })

        # ── Scenario comparison (generate alternatives) ──
        scenario_comparison = [
            {
                'name': simulation.scenario.name if simulation.scenario else 'Current Scenario',
                'initial': initial_score,
                'after': round(score_after, 4),
                'reduction': abs(round(reduction_rel, 1)),
                'level': classify_risk(score_after),
                'best': True,
                'confidence': confidence_score,
            },
        ]
        # Generate alternative scenarios from DB
        other_scenarios = IPageScenario.objects.exclude(
            id=simulation.scenario_id
        ).prefetch_related('scenario_mechanisms')[:2]

        for alt_scenario in other_scenarios:
            # Calculate alternative scenario impact
            alt_mechs = alt_scenario.scenario_mechanisms.filter(active=True)
            alt_total = 0.0
            for am in alt_mechs:
                effects = IPageMechanismEffect.objects.filter(
                    mechanism=am.mechanism
                ).values_list('indicator_id', 'value')
                effect_map = dict(effects)
                for ind_id in indicator_ids:
                    alt_total += effect_map.get(ind_id, 0.0) * am.level

            alt_avg = alt_total / (len(indicator_ids) * max(1, alt_mechs.count())) if indicator_ids else 0.0
            alt_score_after = max(0.0, initial_score - min(0.35, alt_avg * 0.25))
            alt_reduction = round(((alt_score_after - initial_score) / initial_score) * 100, 1) if initial_score > 0 else 0.0

            scenario_comparison.append({
                'name': alt_scenario.name,
                'initial': initial_score,
                'after': round(alt_score_after, 4),
                'reduction': abs(alt_reduction),
                'level': classify_risk(alt_score_after),
                'best': False,
                'confidence': max(40, confidence_score - 10),
            })

        # ── Return full response ──
        return Response({
            'simulation': IPageSimulationSerializer(simulation).data,
            'before_trend': before_trend,
            'after_trend': after_trend,
            'scenario_comparison': scenario_comparison,
            'indicator_results': [
                {
                    'indicator': indicators.get(id=r['indicator_id']).name,
                    'impact_value': r['impact_value'],
                    'reduction_pct': r['reduction_pct'],
                }
                for r in indicator_results
            ],
        })


# ──────────────────────────────────────────────────────────────
# Bootstrap data helper
# ──────────────────────────────────────────────────────────────

@api_view(['POST'])
def ipage_bootstrap(request):
    """Initialize I-PAGe reference data (indicators, mechanisms, scenarios) if empty."""
    project_id = get_user_project_id(request)
    # Check within the project scope
    if project_id:
        if IPageIndicator.objects.filter(project_id=project_id).exists():
            return Response({'status': 'already_initialized'})
    else:
        if IPageIndicator.objects.exists():
            return Response({'status': 'already_initialized'})

    # Create indicators
    indicator_data = [
        ('Error rate', 'error_rate', 1),
        ('Algorithmic bias', 'algorithmic_bias', 2),
        ('Transparency', 'transparency', 3),
        ('Number of complaints', 'complaints', 4),
        ('Processing time', 'processing_time', 5),
        ('Regulatory compliance', 'regulatory_compliance', 6),
    ]
    indicators = {}
    for name, code, order in indicator_data:
        ind = IPageIndicator.objects.create(name=name, code=code, order=order, project_id=project_id)
        indicators[code] = ind

    # Create mechanisms with effects
    mechanism_data = [
        {
            'name': 'Regular algorithmic audit',
            'description': 'Perform periodic audits of algorithms and the data used.',
            'default_active': True,
            'default_level': 0.8,
            'effects': {
                'error_rate': 0.8,
                'algorithmic_bias': 0.7,
                'transparency': 0.6,
                'complaints': 0.4,
                'processing_time': 0.3,
                'regulatory_compliance': 0.6,
            },
        },
        {
            'name': 'Technical data improvements',
            'description': 'Improve data quality, diversity and governance.',
            'default_active': True,
            'default_level': 0.6,
            'effects': {
                'error_rate': 0.7,
                'algorithmic_bias': 0.5,
                'transparency': 0.2,
                'complaints': 0.1,
                'processing_time': 0.6,
                'regulatory_compliance': 0.3,
            },
        },
        {
            'name': 'Transparency and explainability',
            'description': 'Implement transparency and explainability practices.',
            'default_active': False,
            'default_level': 0.7,
            'effects': {
                'error_rate': 0.2,
                'algorithmic_bias': 0.6,
                'transparency': 0.8,
                'complaints': 0.3,
                'processing_time': 0.1,
                'regulatory_compliance': 0.4,
            },
        },
        {
            'name': 'Training & awareness',
            'description': 'Ongoing team training and risk awareness.',
            'default_active': True,
            'default_level': 0.5,
            'effects': {
                'error_rate': 0.3,
                'algorithmic_bias': 0.6,
                'transparency': 0.4,
                'complaints': 0.2,
                'processing_time': 0.1,
                'regulatory_compliance': 0.2,
            },
        },
        {
            'name': 'Data governance',
            'description': 'Establish robust governance for data and models.',
            'default_active': False,
            'default_level': 0.6,
            'effects': {
                'error_rate': 0.6,
                'algorithmic_bias': 0.4,
                'transparency': 0.3,
                'complaints': 0.3,
                'processing_time': 0.2,
                'regulatory_compliance': 0.6,
            },
        },
        {
            'name': 'Regulation & compliance',
            'description': 'Align with applicable standards and regulations.',
            'default_active': False,
            'default_level': 0.0,
            'effects': {
                'error_rate': 0.1,
                'algorithmic_bias': 0.2,
                'transparency': 0.1,
                'complaints': 0.0,
                'processing_time': 0.0,
                'regulatory_compliance': 0.4,
            },
        },
    ]

    mechanisms = []
    for mech_data in mechanism_data:
        effects_data = mech_data.pop('effects')
        mech = IPageMechanism.objects.create(**mech_data, project_id=project_id)
        mechanisms.append(mech)
        for code, value in effects_data.items():
            IPageMechanismEffect.objects.create(
                mechanism=mech,
                indicator=indicators[code],
                value=value,
            )

    # Create scenarios
    scenario_data = [
        {
            'name': 'Governance & Technical Strengthening',
            'description': 'Scenario combining governance controls and technical actions to reduce risk.',
            'mechanisms': [
                (0, True, 0.8),
                (1, True, 0.6),
                (2, False, 0.7),
                (3, True, 0.5),
                (4, False, 0.6),
                (5, False, 0.0),
            ],
        },
        {
            'name': 'Compliance-Focused Approach',
            'description': 'Scenario focused on regulatory compliance and formal audits.',
            'mechanisms': [
                (0, True, 0.7),
                (1, False, 0.3),
                (2, True, 0.6),
                (3, False, 0.3),
                (4, True, 0.5),
                (5, True, 0.8),
            ],
        },
        {
            'name': 'Minimal Technical Approach',
            'description': 'Minimal scenario with basic technical actions only.',
            'mechanisms': [
                (0, False, 0.3),
                (1, True, 0.5),
                (2, False, 0.2),
                (3, False, 0.2),
                (4, True, 0.4),
                (5, False, 0.0),
            ],
        },
    ]

    for sdata in scenario_data:
        mechs_config = sdata.pop('mechanisms')
        scenario = IPageScenario.objects.create(**sdata, project_id=project_id)
        for mech_idx, active, level in mechs_config:
            IPageScenarioMechanism.objects.create(
                scenario=scenario,
                mechanism=mechanisms[mech_idx],
                active=active,
                level=level,
            )

    return Response({'status': 'initialized', 'indicators': len(indicators),
                     'mechanisms': len(mechanisms), 'scenarios': len(scenario_data)})
