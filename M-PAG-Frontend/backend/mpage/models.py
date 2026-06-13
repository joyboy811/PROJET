"""
M-PAGe Data Models
==================
Hierarchy:  KeyPillar -> Dimension -> Factor -> Item
RMM:        RiskMitigationMechanism linked to KeyPillars via weights
Campaign:   Assessment campaigns with ItemResponses
Results:    ReadinessLevel, RMMCResult, RMCResult, GPMResult
"""
from django.db import models
from django.contrib.auth.models import User


# ──────────────────────────────────────────────────────────────
# Reference data: Pillar hierarchy
# ──────────────────────────────────────────────────────────────

class KeyPillar(models.Model):
    """Key pillars are created from O-PAGe key pillars and stored in M-PAGe."""
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    pillar_type = models.CharField(max_length=255)
    icon = models.CharField(max_length=50, blank=True, default='shield')

    def save(self, *args, **kwargs):
        if self.pillar_type:
            self.pillar_type = self.pillar_type.strip().lower()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'mpage_keypillar'
        ordering = ['id']

    def __str__(self):
        return self.name


class Dimension(models.Model):
    """Operational dimension within a pillar"""
    pillar = models.ForeignKey(KeyPillar, on_delete=models.CASCADE, related_name='dimensions')
    name   = models.CharField(max_length=255)
    code   = models.CharField(max_length=50)

    class Meta:
        db_table = 'mpage_dimension'
        ordering = ['id']

    def __str__(self):
        return f"{self.pillar.code} / {self.name}"


class Factor(models.Model):
    """Factor within a dimension"""
    dimension = models.ForeignKey(Dimension, on_delete=models.CASCADE, related_name='factors')
    name      = models.CharField(max_length=255)
    code      = models.CharField(max_length=50)

    class Meta:
        db_table = 'mpage_factor'
        ordering = ['id']

    def __str__(self):
        return f"{self.dimension.code} / {self.name}"


class Item(models.Model):
    """Questionnaire item (question). Response is ordinal 1-5."""
    factor = models.ForeignKey(Factor, on_delete=models.CASCADE, related_name='items')
    label  = models.TextField()
    code   = models.CharField(max_length=50)

    class Meta:
        db_table = 'mpage_item'
        ordering = ['id']

    def __str__(self):
        return f"{self.code}: {self.label[:60]}"


# ──────────────────────────────────────────────────────────────
# Risk Mitigation Mechanisms (RMM)
# ──────────────────────────────────────────────────────────────

class RiskMitigationMechanism(models.Model):
    """
    A mechanism that mitigates a specific risk.
    The associated_risk_id references a Risk in the O-PAGe module (same DB).
    """
    name               = models.CharField(max_length=255)
    description        = models.TextField(blank=True)
    associated_risk_id = models.IntegerField(
        help_text="ID of the Risk in O-PAGe (OPAGe_risk table)"
    )
    associated_risk_name = models.CharField(
        max_length=255, blank=True,
        help_text="Cached name of the associated risk from O-PAGe"
    )

    class Meta:
        db_table = 'mpage_rmm'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} (Risk: {self.associated_risk_name})"


class RMMKeyPillarWeight(models.Model):
    """Weight of a KeyPillar for a specific RMM. Sum of weights per RMM = 1.0"""
    rmm        = models.ForeignKey(RiskMitigationMechanism, on_delete=models.CASCADE, related_name='kp_weights')
    key_pillar = models.ForeignKey(KeyPillar, on_delete=models.CASCADE, related_name='rmm_weights')
    weight     = models.FloatField(default=0.0)

    class Meta:
        db_table = 'mpage_rmm_kp_weight'
        unique_together = ('rmm', 'key_pillar')

    def __str__(self):
        return f"{self.rmm.name} x {self.key_pillar.name} = {self.weight}"


# ──────────────────────────────────────────────────────────────
# Assessment Campaigns
# ──────────────────────────────────────────────────────────────

class Campaign(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminee'),
    ]
    name         = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    launch_date  = models.DateField(auto_now_add=True)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'mpage_campaign'
        ordering = ['-launch_date']

    def __str__(self):
        return f"{self.name} ({self.status})"


class ItemResponse(models.Model):
    """Response to an item within a campaign"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='responses')
    item     = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='responses')
    response = models.FloatField(
        default=0.0,
        help_text="Calculated average score from 1 to 5"
    )
    raw_data = models.JSONField(
        blank=True, null=True,
        help_text="Raw responses from the Excel import (e.g. Resp1, Resp2...)"
    )
    comment  = models.TextField(blank=True)

    class Meta:
        db_table = 'mpage_item_response'
        unique_together = ('campaign', 'item')

    def __str__(self):
        return f"{self.item.code} = {self.response}"


# ──────────────────────────────────────────────────────────────
# Computed Results
# ──────────────────────────────────────────────────────────────

class ReadinessLevel(models.Model):
    """RL score per pillar, per RMM, per campaign"""
    campaign   = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='readiness_levels')
    key_pillar = models.ForeignKey(KeyPillar, on_delete=models.CASCADE)
    rmm        = models.ForeignKey(RiskMitigationMechanism, on_delete=models.CASCADE, null=True, blank=True)
    score      = models.FloatField(default=0.0)

    class Meta:
        db_table = 'mpage_readiness_level'

    def __str__(self):
        return f"RL({self.key_pillar.code}) = {self.score:.3f}"


class RMMCResult(models.Model):
    """Risk Mitigation Mechanism Capacity per campaign"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='rmmc_results')
    rmm      = models.ForeignKey(RiskMitigationMechanism, on_delete=models.CASCADE)
    score    = models.FloatField(default=0.0)

    class Meta:
        db_table = 'mpage_rmmc_result'
        unique_together = ('campaign', 'rmm')

    def __str__(self):
        return f"RMMC({self.rmm.name}) = {self.score:.3f}"


class RMCResult(models.Model):
    """Risk Mitigation Capacity per risk per campaign"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='rmc_results')
    risk_id  = models.IntegerField(help_text="O-PAGe Risk ID")
    risk_name = models.CharField(max_length=255, blank=True)
    score    = models.FloatField(default=0.0)

    class Meta:
        db_table = 'mpage_rmc_result'
        unique_together = ('campaign', 'risk_id')

    def __str__(self):
        return f"RMC(Risk {self.risk_id}) = {self.score:.3f}"


class GPMResult(models.Model):
    """Global PAGe Maturity per campaign"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='gpm_results')
    score    = models.FloatField(default=0.0)

    class Meta:
        db_table = 'mpage_gpm_result'

    def __str__(self):
        return f"GPM = {self.score:.3f}"


# ──────────────────────────────────────────────────────────────
# I-PAGe: Impact Simulation
# ──────────────────────────────────────────────────────────────

class IPageIndicator(models.Model):
    """Impact indicators used in simulation (e.g. error rate, bias, transparency)"""
    name  = models.CharField(max_length=255, unique=True)
    code  = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'ipage_indicator'
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class IPageScenario(models.Model):
    """A mitigation scenario grouping multiple mechanisms"""
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ipage_scenario'
        ordering = ['id']

    def __str__(self):
        return self.name


class IPageMechanism(models.Model):
    """A mitigation mechanism used in impact simulation"""
    name             = models.CharField(max_length=255)
    description      = models.TextField(blank=True)
    default_active   = models.BooleanField(default=False)
    default_level    = models.FloatField(default=0.5)

    class Meta:
        db_table = 'ipage_mechanism'
        ordering = ['id']

    def __str__(self):
        return self.name


class IPageMechanismEffect(models.Model):
    """Impact coefficient of a mechanism on an indicator (value -1 to +1)"""
    mechanism = models.ForeignKey(IPageMechanism, on_delete=models.CASCADE, related_name='effects')
    indicator = models.ForeignKey(IPageIndicator, on_delete=models.CASCADE, related_name='mechanism_effects')
    value     = models.FloatField(default=0.0, help_text="Impact coefficient from -1.0 to +1.0")

    class Meta:
        db_table = 'ipage_mechanism_effect'
        unique_together = ('mechanism', 'indicator')

    def __str__(self):
        return f"{self.mechanism.name} → {self.indicator.name} = {self.value}"


class IPageScenarioMechanism(models.Model):
    """Link between a scenario and its mechanisms with configured state"""
    scenario  = models.ForeignKey(IPageScenario, on_delete=models.CASCADE, related_name='scenario_mechanisms')
    mechanism = models.ForeignKey(IPageMechanism, on_delete=models.CASCADE, related_name='scenario_uses')
    active    = models.BooleanField(default=True)
    level     = models.FloatField(default=0.5, help_text="Deployment level 0.0 to 1.0")

    class Meta:
        db_table = 'ipage_scenario_mechanism'
        unique_together = ('scenario', 'mechanism')

    def __str__(self):
        return f"{self.scenario.name} × {self.mechanism.name} (level={self.level})"


class IPageSimulation(models.Model):
    """A saved simulation run"""
    METHOD_CHOICES = [
        ('linear', 'Linear Propagation'),
        ('monte_carlo', 'Simplified Monte Carlo'),
        ('diffusion', 'Diffusion Model'),
    ]
    CONFIDENCE_CHOICES = [
        ('low', 'Low (25%)'),
        ('medium', 'Medium (50%)'),
        ('high', 'High (75%)'),
    ]
    HORIZON_CHOICES = [
        ('6m', '6 mois'),
        ('12m', '12 mois'),
        ('18m', '18 mois'),
        ('24m', '24 mois'),
    ]

    name           = models.CharField(max_length=255, blank=True)
    organization   = models.CharField(max_length=255, blank=True)
    department     = models.CharField(max_length=255, blank=True)
    risk_id        = models.IntegerField(help_text="O-PAGe Risk ID")
    risk_name      = models.CharField(max_length=255, blank=True)
    risk_score     = models.FloatField(default=0.0, help_text="Initial risk score from O-PAGe")
    scenario       = models.ForeignKey(IPageScenario, on_delete=models.SET_NULL, null=True, blank=True)
    method         = models.CharField(max_length=20, choices=METHOD_CHOICES, default='linear')
    confidence     = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES, default='medium')
    horizon        = models.CharField(max_length=10, choices=HORIZON_CHOICES, default='12m')
    iterations     = models.IntegerField(default=1000)
    created_by     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    # ── Computed results (stored after run) ──
    risk_score_after    = models.FloatField(default=0.0)
    reduction_absolute  = models.FloatField(default=0.0)
    reduction_relative  = models.FloatField(default=0.0)
    confidence_score    = models.FloatField(default=0.0)
    risk_level_before   = models.CharField(max_length=20, blank=True)
    risk_level_after    = models.CharField(max_length=20, blank=True)
    computed            = models.BooleanField(default=False)

    class Meta:
        db_table = 'ipage_simulation'
        ordering = ['-created_at']

    def __str__(self):
        return f"Simulation: {self.name or f'Risk {self.risk_id}'} ({self.created_at})"


class IPageSimulationMechanism(models.Model):
    """Mechanism configuration snapshot for a specific simulation run"""
    simulation = models.ForeignKey(IPageSimulation, on_delete=models.CASCADE, related_name='sim_mechanisms')
    mechanism  = models.ForeignKey(IPageMechanism, on_delete=models.CASCADE)
    active     = models.BooleanField(default=True)
    level      = models.FloatField(default=0.5)

    class Meta:
        db_table = 'ipage_simulation_mechanism'
        unique_together = ('simulation', 'mechanism')


class IPageSimulationResult(models.Model):
    """Per-indicator result of a simulation"""
    simulation     = models.ForeignKey(IPageSimulation, on_delete=models.CASCADE, related_name='results')
    indicator      = models.ForeignKey(IPageIndicator, on_delete=models.CASCADE)
    impact_value   = models.FloatField(default=0.0, help_text="Averaged impact on this indicator")
    reduction_pct  = models.FloatField(default=0.0, help_text="Percentage reduction")

    class Meta:
        db_table = 'ipage_simulation_result'
        unique_together = ('simulation', 'indicator')
