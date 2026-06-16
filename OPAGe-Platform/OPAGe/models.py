from django.db import models

class RiskLevel(models.TextChoices):
    LOW      = "LOW",      "Low"
    MODERATE = "MODERATE", "Moderate"
    HIGH     = "HIGH",     "High"
    CRITICAL = "CRITICAL", "Critical"

class IndicatorStatus(models.TextChoices):
    POSITIVE = "POSITIVE", "Positive"
    NEGATIVE = "NEGATIVE", "Negative"
    SPECIAL  = "SPECIAL",  "Special"


class Risk(models.Model):
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project_id  = models.IntegerField(null=True, blank=True, help_text="Project ID for multi-project isolation")

    def compute_score(self):
        total = 0.0
        for ind in self.indicators.all():
            iv = ind.indicator_values.order_by('-created_at').first()
            if iv:
                total += ind.weight * iv.normalized_value
        return round(total, 4)

    def __str__(self):
        return self.name


class Indicator(models.Model):
    risk    = models.ForeignKey(Risk, on_delete=models.CASCADE, related_name='indicators')
    label   = models.CharField(max_length=255)
    weight  = models.FloatField()
    status  = models.CharField(max_length=20, choices=IndicatorStatus.choices)
    val_min = models.FloatField(default=0)
    val_max = models.FloatField(default=10)

    def __str__(self):
        return self.label


class IndicatorValue(models.Model):
    indicator        = models.ForeignKey(Indicator, on_delete=models.CASCADE, related_name='indicator_values')
    raw_value        = models.FloatField()
    normalized_value = models.FloatField(blank=True, default=0.0)
    created_at       = models.DateTimeField(auto_now_add=True)

    def normalize(self):
        if self.indicator.status == IndicatorStatus.POSITIVE:
            return self.raw_value
        elif self.indicator.status == IndicatorStatus.NEGATIVE:
            return 1 - self.raw_value
        else:
            return self.raw_value

    def save(self, *args, **kwargs):
        # 1. Normaliser automatiquement
        self.normalized_value = self.normalize()
        super().save(*args, **kwargs)

        # 2. Recalculer le RiskScore automatiquement
        risk        = self.indicator.risk
        score_value = risk.compute_score()
        category    = self._categorize(score_value)
        RiskScore.objects.update_or_create(
            risk=risk,
            defaults={'score': score_value, 'category': category}
        )

    def _categorize(self, score):
        if score < 0.25: return RiskLevel.LOW
        if score < 0.50: return RiskLevel.MODERATE
        if score < 0.75: return RiskLevel.HIGH
        return RiskLevel.CRITICAL

    def __str__(self):
        return f"{self.indicator.label} = {self.raw_value}"


class RiskScore(models.Model):
    risk            = models.ForeignKey(Risk, on_delete=models.CASCADE, related_name='scores')
    score           = models.FloatField()
    category        = models.CharField(max_length=20, choices=RiskLevel.choices)
    calculated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.risk.name} → {self.score} ({self.category})"


class KeyPillar(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, blank=True)
    project_id = models.IntegerField(null=True, blank=True, help_text="Project ID for multi-project isolation")

    def __str__(self):
        return self.name


class RMM(models.Model):
    risk        = models.ForeignKey(Risk, on_delete=models.CASCADE, related_name='rmms')
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project_id  = models.IntegerField(null=True, blank=True, help_text="Project ID for multi-project isolation")

    def __str__(self):
        return f"{self.risk.name} — {self.name}"


class RMMKeyPillarWeight(models.Model):
    rmm        = models.ForeignKey(RMM, on_delete=models.CASCADE, related_name='kp_weights')
    key_pillar = models.ForeignKey(KeyPillar, on_delete=models.CASCADE, related_name='rmm_weights')
    weight     = models.FloatField()

    class Meta:
        unique_together = ('rmm', 'key_pillar')

    def __str__(self):
        return f"{self.rmm.name} × {self.key_pillar.name} = {self.weight}"