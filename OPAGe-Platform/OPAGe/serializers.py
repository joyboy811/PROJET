from rest_framework import serializers
from .models import Risk, Indicator, IndicatorValue, RiskScore, RMM, KeyPillar, RMMKeyPillarWeight


class IndicatorValueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = IndicatorValue
        fields = ['id', 'indicator', 'raw_value', 'normalized_value', 'created_at']
        read_only_fields = ['normalized_value', 'created_at']


class IndicatorSerializer(serializers.ModelSerializer):
    latest_value = serializers.SerializerMethodField()

    class Meta:
        model  = Indicator
        fields = ['id', 'risk', 'label', 'weight', 'status', 'val_min', 'val_max', 'latest_value']

    def get_latest_value(self, obj):
        iv = obj.indicator_values.order_by('-created_at').first()
        if iv:
            return IndicatorValueSerializer(iv).data
        return None


class RiskScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RiskScore
        fields = ['id', 'risk', 'score', 'category', 'calculated_date']


class RMMKeyPillarWeightSerializer(serializers.ModelSerializer):
    key_pillar_name = serializers.CharField(source='key_pillar.name', read_only=True)

    class Meta:
        model  = RMMKeyPillarWeight
        fields = ['id', 'rmm', 'key_pillar', 'key_pillar_name', 'weight']


class RMMSerializer(serializers.ModelSerializer):
    kp_weights = RMMKeyPillarWeightSerializer(many=True, read_only=True)

    class Meta:
        model  = RMM
        fields = ['id', 'risk', 'name', 'description', 'kp_weights']


class RiskSerializer(serializers.ModelSerializer):
    indicators = IndicatorSerializer(many=True, read_only=True)
    scores     = RiskScoreSerializer(many=True, read_only=True)
    rmms       = RMMSerializer(many=True, read_only=True)

    class Meta:
        model  = Risk
        fields = ['id', 'name', 'description', 'indicators', 'scores', 'rmms']


class KeyPillarSerializer(serializers.ModelSerializer):
    class Meta:
        model  = KeyPillar
        fields = ['id', 'name', 'type']