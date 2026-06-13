from django.contrib import admin
from .models import Risk, Indicator, RiskScore

admin.site.register(Risk)
admin.site.register(Indicator)
admin.site.register(RiskScore)