from rest_framework import viewsets
from .models import Risk, Indicator, IndicatorValue, RiskScore, RMM, KeyPillar, RMMKeyPillarWeight
from .serializers import (
    RiskSerializer, IndicatorSerializer, IndicatorValueSerializer,
    RiskScoreSerializer, RMMSerializer, KeyPillarSerializer,
    RMMKeyPillarWeightSerializer
)


class ProjectFilterMixin:
    """Filter queryset by project_id query param when provided."""
    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs


class RiskViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset         = Risk.objects.all()
    serializer_class = RiskSerializer

    def perform_create(self, serializer):
        project_id = self.request.data.get('project_id') or self.request.query_params.get('project_id')
        serializer.save(project_id=project_id)


class IndicatorViewSet(viewsets.ModelViewSet):
    queryset         = Indicator.objects.all()
    serializer_class = IndicatorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(risk__project_id=project_id)
        return qs


class IndicatorValueViewSet(viewsets.ModelViewSet):
    queryset         = IndicatorValue.objects.all()
    serializer_class = IndicatorValueSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(indicator__risk__project_id=project_id)
        return qs


class RiskScoreViewSet(viewsets.ModelViewSet):
    queryset         = RiskScore.objects.all()
    serializer_class = RiskScoreSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(risk__project_id=project_id)
        return qs


class RMMViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset         = RMM.objects.all()
    serializer_class = RMMSerializer

    def perform_create(self, serializer):
        project_id = self.request.data.get('project_id') or self.request.query_params.get('project_id')
        serializer.save(project_id=project_id)


class KeyPillarViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset         = KeyPillar.objects.all()
    serializer_class = KeyPillarSerializer

    def perform_create(self, serializer):
        project_id = self.request.data.get('project_id') or self.request.query_params.get('project_id')
        serializer.save(project_id=project_id)


class RMMKeyPillarWeightViewSet(viewsets.ModelViewSet):
    queryset         = RMMKeyPillarWeight.objects.all()
    serializer_class = RMMKeyPillarWeightSerializer