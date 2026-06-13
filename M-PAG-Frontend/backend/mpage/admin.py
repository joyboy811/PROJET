from django.contrib import admin
from .models import (
    KeyPillar, Dimension, Factor, Item,
    RiskMitigationMechanism, RMMKeyPillarWeight,
    Campaign, ItemResponse,
    ReadinessLevel, RMMCResult, RMCResult, GPMResult,
)

admin.site.register(KeyPillar)
admin.site.register(Dimension)
admin.site.register(Factor)
admin.site.register(Item)
admin.site.register(RiskMitigationMechanism)
admin.site.register(RMMKeyPillarWeight)
admin.site.register(Campaign)
admin.site.register(ItemResponse)
admin.site.register(ReadinessLevel)
admin.site.register(RMMCResult)
admin.site.register(RMCResult)
admin.site.register(GPMResult)
