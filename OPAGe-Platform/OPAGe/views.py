from rest_framework import viewsets
from .models import Risk, Indicator, IndicatorValue, RiskScore, RMM, KeyPillar, RMMKeyPillarWeight
from .serializers import (
    RiskSerializer, IndicatorSerializer, IndicatorValueSerializer,
    RiskScoreSerializer, RMMSerializer, KeyPillarSerializer,
    RMMKeyPillarWeightSerializer
)


class RiskViewSet(viewsets.ModelViewSet):
    queryset         = Risk.objects.all()
    serializer_class = RiskSerializer


class IndicatorViewSet(viewsets.ModelViewSet):
    queryset         = Indicator.objects.all()
    serializer_class = IndicatorSerializer


class IndicatorValueViewSet(viewsets.ModelViewSet):
    queryset         = IndicatorValue.objects.all()
    serializer_class = IndicatorValueSerializer


class RiskScoreViewSet(viewsets.ModelViewSet):
    queryset         = RiskScore.objects.all()
    serializer_class = RiskScoreSerializer


class RMMViewSet(viewsets.ModelViewSet):
    queryset         = RMM.objects.all()
    serializer_class = RMMSerializer


class KeyPillarViewSet(viewsets.ModelViewSet):
    queryset         = KeyPillar.objects.all()
    serializer_class = KeyPillarSerializer


class RMMKeyPillarWeightViewSet(viewsets.ModelViewSet):
    queryset         = RMMKeyPillarWeight.objects.all()
    serializer_class = RMMKeyPillarWeightSerializer