"""
I-PAGe Serializers
==================
Serializers for the Impact Simulation module.
"""
from rest_framework import serializers
from .models import (
    IPageIndicator, IPageScenario, IPageMechanism,
    IPageMechanismEffect, IPageScenarioMechanism,
    IPageSimulation, IPageSimulationMechanism, IPageSimulationResult,
)


class IPageIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPageIndicator
        fields = ['id', 'name', 'code', 'order']


class IPageMechanismEffectSerializer(serializers.ModelSerializer):
    indicator_name = serializers.CharField(source='indicator.name', read_only=True)
    indicator_code = serializers.CharField(source='indicator.code', read_only=True)

    class Meta:
        model = IPageMechanismEffect
        fields = ['id', 'mechanism', 'indicator', 'indicator_name', 'indicator_code', 'value']


class IPageMechanismSerializer(serializers.ModelSerializer):
    effects = IPageMechanismEffectSerializer(many=True, read_only=True)

    class Meta:
        model = IPageMechanism
        fields = ['id', 'name', 'description', 'default_active', 'default_level', 'effects']


class IPageScenarioMechanismSerializer(serializers.ModelSerializer):
    mechanism_name = serializers.CharField(source='mechanism.name', read_only=True)

    class Meta:
        model = IPageScenarioMechanism
        fields = ['id', 'scenario', 'mechanism', 'mechanism_name', 'active', 'level']


class IPageScenarioSerializer(serializers.ModelSerializer):
    scenario_mechanisms = IPageScenarioMechanismSerializer(many=True, read_only=True)

    class Meta:
        model = IPageScenario
        fields = ['id', 'name', 'description', 'created_at', 'scenario_mechanisms']


class IPageScenarioListSerializer(serializers.ModelSerializer):
    """Lightweight without nested mechanisms"""
    class Meta:
        model = IPageScenario
        fields = ['id', 'name', 'description', 'created_at']


class IPageSimulationMechanismSerializer(serializers.ModelSerializer):
    mechanism_name = serializers.CharField(source='mechanism.name', read_only=True)

    class Meta:
        model = IPageSimulationMechanism
        fields = ['id', 'simulation', 'mechanism', 'mechanism_name', 'active', 'level']


class IPageSimulationResultSerializer(serializers.ModelSerializer):
    indicator_name = serializers.CharField(source='indicator.name', read_only=True)
    indicator_code = serializers.CharField(source='indicator.code', read_only=True)

    class Meta:
        model = IPageSimulationResult
        fields = ['id', 'simulation', 'indicator', 'indicator_name', 'indicator_code',
                  'impact_value', 'reduction_pct']


class IPageSimulationSerializer(serializers.ModelSerializer):
    sim_mechanisms = IPageSimulationMechanismSerializer(many=True, read_only=True)
    results = IPageSimulationResultSerializer(many=True, read_only=True)
    scenario_name = serializers.CharField(source='scenario.name', read_only=True, default='')

    class Meta:
        model = IPageSimulation
        fields = [
            'id', 'name', 'organization', 'department',
            'risk_id', 'risk_name', 'risk_score', 'scenario', 'scenario_name',
            'method', 'confidence', 'horizon', 'iterations',
            'created_by', 'created_at',
            'risk_score_after', 'reduction_absolute', 'reduction_relative',
            'confidence_score', 'risk_level_before', 'risk_level_after',
            'computed', 'sim_mechanisms', 'results',
        ]
        read_only_fields = [
            'created_at', 'created_by',
            'risk_score_after', 'reduction_absolute', 'reduction_relative',
            'confidence_score', 'risk_level_before', 'risk_level_after',
            'computed',
        ]


class IPageSimulationCreateSerializer(serializers.ModelSerializer):
    """For creating a simulation - accepts mechanism configs inline"""
    mechanisms = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = IPageSimulation
        fields = [
            'id', 'name', 'organization', 'department',
            'risk_id', 'risk_name', 'risk_score',
            'scenario', 'method', 'confidence', 'horizon', 'iterations',
            'mechanisms',
        ]

    def create(self, validated_data):
        mechanisms_data = validated_data.pop('mechanisms', [])
        simulation = IPageSimulation.objects.create(**validated_data)

        for mech_data in mechanisms_data:
            IPageSimulationMechanism.objects.create(
                simulation=simulation,
                mechanism_id=mech_data['mechanism_id'],
                active=mech_data.get('active', True),
                level=mech_data.get('level', 0.5),
            )

        return simulation
