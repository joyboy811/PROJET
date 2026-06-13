"""
M-PAGe Calculation Engine
=========================
Implements the multi-level aggregation:

    Item (1-5) -> normalized [0,1]
    -> Factor score   = mean(items)
    -> Dimension score = mean(factors)
    -> RL per pillar   = mean(dimensions)
    -> RMMC per RMM    = sum(weight_kp * RL_kp)
    -> RMC per risk    = mean(RMMC for that risk)
    -> GPM global      = mean(RMC across all risks)
"""
from django.db.models import Avg
from .models import (
    KeyPillar, Dimension, Factor, Item, ItemResponse,
    RiskMitigationMechanism, RMMKeyPillarWeight,
    Campaign, ReadinessLevel, RMMCResult, RMCResult, GPMResult,
)


def normalize_item_score(raw_score: int) -> float:
    """Normalize item score from 1-5 to 0-1 range"""
    return (raw_score - 1) / 4.0


def compute_factor_score(campaign_id: int, factor_id: int) -> float:
    """Average normalized score of all items within a factor"""
    responses = ItemResponse.objects.filter(
        campaign_id=campaign_id,
        item__factor_id=factor_id,
    )
    if not responses.exists():
        return 0.0
    total = sum(normalize_item_score(r.response) for r in responses)
    return total / responses.count()


def compute_dimension_score(campaign_id: int, dimension_id: int) -> float:
    """Average score of all factors within a dimension"""
    dimension = Dimension.objects.get(id=dimension_id)
    factors = dimension.factors.all()
    if not factors.exists():
        return 0.0
    scores = [compute_factor_score(campaign_id, f.id) for f in factors]
    return sum(scores) / len(scores)


LEGACY_PILLAR_CODES = [
    'governance',
    'org',
    'organizational',
    'gov',
    'legal',
    'technical',
    'tech',
    'human',
    'financial',
]


def compute_readiness_level(campaign_id: int, pillar_id: int) -> float:
    """RL = average score of all dimensions within a pillar"""
    pillar = KeyPillar.objects.get(id=pillar_id)
    dimensions = pillar.dimensions.all()
    if not dimensions.exists():
        return 0.0
    scores = [compute_dimension_score(campaign_id, d.id) for d in dimensions]
    return sum(scores) / len(scores)


def compute_rmmc(campaign_id: int, rmm_id: int) -> float:
    """
    RMMC = sum(weight_kp * RL_kp) for all key pillars of the RMM.
    Each KP has a configured weight, and its RL is computed from the campaign.
    """
    weights = RMMKeyPillarWeight.objects.filter(rmm_id=rmm_id).select_related('key_pillar')
    if not weights.exists():
        return 0.0

    total = 0.0
    for w in weights:
        if w.key_pillar.code in LEGACY_PILLAR_CODES:
            continue
        rl = compute_readiness_level(campaign_id, w.key_pillar_id)
        total += w.weight * rl
    return total


def compute_rmc(campaign_id: int, risk_id: int) -> float:
    """
    RMC = mean(RMMC) for all RMMs associated with a given risk.
    """
    rmms = RiskMitigationMechanism.objects.filter(associated_risk_id=risk_id)
    if not rmms.exists():
        return 0.0
    scores = [compute_rmmc(campaign_id, rmm.id) for rmm in rmms]
    return sum(scores) / len(scores)


def compute_gpm(campaign_id: int) -> float:
    """
    GPM = mean(RMC) across all unique risks referenced by RMMs.
    """
    risk_ids = RiskMitigationMechanism.objects.values_list(
        'associated_risk_id', flat=True
    ).distinct()
    if not risk_ids:
        return 0.0
    scores = [compute_rmc(campaign_id, rid) for rid in risk_ids]
    return sum(scores) / len(scores)


def run_full_calculation(campaign_id: int) -> dict:
    """
    Run the complete M-PAGe calculation pipeline for a campaign.
    Stores results in the database and returns a summary dict.
    """
    campaign = Campaign.objects.get(id=campaign_id)
    pillars = KeyPillar.objects.exclude(code__in=LEGACY_PILLAR_CODES)

    # 1. Compute and store Readiness Levels
    rl_results = {}
    for pillar in pillars:
        rl = compute_readiness_level(campaign_id, pillar.id)
        ReadinessLevel.objects.update_or_create(
            campaign=campaign,
            key_pillar=pillar,
            rmm=None,
            defaults={'score': round(rl, 4)},
        )
        rl_results[pillar.code] = round(rl, 4)

    # 2. Compute and store RMMC for each mechanism
    rmmc_results = {}
    rmms = RiskMitigationMechanism.objects.all()
    for rmm in rmms:
        rmmc_score = compute_rmmc(campaign_id, rmm.id)
        RMMCResult.objects.update_or_create(
            campaign=campaign,
            rmm=rmm,
            defaults={'score': round(rmmc_score, 4)},
        )
        rmmc_results[rmm.id] = {
            'name': rmm.name,
            'score': round(rmmc_score, 4),
        }

    # 3. Compute and store RMC per risk
    rmc_results = {}
    risk_ids = rmms.values_list('associated_risk_id', flat=True).distinct()
    for risk_id in risk_ids:
        rmc_score = compute_rmc(campaign_id, risk_id)
        risk_name = rmms.filter(associated_risk_id=risk_id).first().associated_risk_name or f"Risk {risk_id}"
        RMCResult.objects.update_or_create(
            campaign=campaign,
            risk_id=risk_id,
            defaults={'score': round(rmc_score, 4), 'risk_name': risk_name},
        )
        rmc_results[risk_id] = {
            'name': risk_name,
            'score': round(rmc_score, 4),
        }

    # 4. Compute and store GPM
    gpm_score = compute_gpm(campaign_id)
    GPMResult.objects.update_or_create(
        campaign=campaign,
        defaults={'score': round(gpm_score, 4)},
    )

    return {
        'campaign_id': campaign_id,
        'readiness_levels': rl_results,
        'rmmc': rmmc_results,
        'rmc': rmc_results,
        'gpm': round(gpm_score, 4),
    }
