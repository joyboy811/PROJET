from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    KeyPillar, Dimension, Factor, Item,
    RiskMitigationMechanism, RMMKeyPillarWeight,
    Campaign, ItemResponse,
    ReadinessLevel, RMMCResult, RMCResult, GPMResult,
    Project,
)
from .models_admin import SystemAdmin


# ── Project ──────────────────────────────────────────────────

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['created_at']


# ── User ─────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'project']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'system_admin'
        groups = obj.groups.values_list('name', flat=True)
        if 'administrateur' in groups:
            return 'administrateur'
        if 'responsable_risques' in groups:
            return 'responsable_risques'
        if 'responsable_org' in groups:
            return 'responsable_org'
        if 'auditeur' in groups:
            return 'auditeur'
        if 'decideur' in groups:
            return 'decideur'
        if 'observateur' in groups:
            return 'observateur'
        return 'observateur'  # default

    def get_project(self, obj):
        try:
            profile = obj.profile
            if profile.project:
                return {'id': profile.project.id, 'name': profile.project.name}
        except Exception:
            pass
        return None


# ── SystemAdmin ──────────────────────────────────────────────

class SystemAdminSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = SystemAdmin
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active']

    def get_role(self, obj):
        return 'system_admin'


# Serializer for creating/updating users (write operations)
class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[
            ('administrateur', 'administrateur'),
            ('responsable_risques', 'responsable_risques'),
            ('responsable_org', 'responsable_org'),
            ('auditeur', 'auditeur'),
            ('decideur', 'decideur'),
            ('observateur', 'observateur'),
        ],
        write_only=True,
        required=True,
    )
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'project_id']

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        project_id = validated_data.pop('project_id', None)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # assign group
        from django.contrib.auth.models import Group
        try:
            grp, _ = Group.objects.get_or_create(name=role)
            user.groups.clear()
            user.groups.add(grp)
        except Exception:
            pass
        # Create/update UserProfile with project
        from .models import UserProfile, Project
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if project_id:
            profile.project_id = project_id
            profile.save()
        from .models_admin import UserPlainPassword
        try:
            UserPlainPassword.objects.update_or_create(
                user=user,
                defaults={'password': password},
            )
        except Exception:
            pass
        # Persist plain password in auth_user.plain_password column
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE auth_user SET plain_password = %s WHERE id = %s",
                    [password, user.id]
                )
        except Exception:
            pass
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        project_id = validated_data.pop('project_id', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        if role:
            from django.contrib.auth.models import Group
            try:
                grp, _ = Group.objects.get_or_create(name=role)
                instance.groups.clear()
                instance.groups.add(grp)
            except Exception:
                pass
        # Update project assignment
        from .models import UserProfile
        if project_id is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.project_id = project_id if project_id else None
            profile.save()
        if password:
            from .models_admin import UserPlainPassword
            try:
                UserPlainPassword.objects.update_or_create(
                    user=instance,
                    defaults={'password': password},
                )
            except Exception:
                pass
            # Persist plain password in auth_user.plain_password column
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE auth_user SET plain_password = %s WHERE id = %s",
                        [password, instance.id]
                    )
            except Exception:
                pass
        return instance


# ── Hierarchy ────────────────────────────────────────────────

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'factor', 'label', 'code']


class FactorSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Factor
        fields = ['id', 'dimension', 'name', 'code', 'items']


class DimensionSerializer(serializers.ModelSerializer):
    factors = FactorSerializer(many=True, read_only=True)

    class Meta:
        model = Dimension
        fields = ['id', 'pillar', 'name', 'code', 'factors']


class KeyPillarSerializer(serializers.ModelSerializer):
    dimensions = DimensionSerializer(many=True, read_only=True)

    class Meta:
        model = KeyPillar
        fields = ['id', 'name', 'code', 'pillar_type', 'icon', 'dimensions']


class KeyPillarListSerializer(serializers.ModelSerializer):
    """Lightweight pillar serializer without nested dimensions"""
    class Meta:
        model = KeyPillar
        fields = ['id', 'name', 'code', 'pillar_type', 'icon']


# ── RMM ──────────────────────────────────────────────────────

class RMMKeyPillarWeightSerializer(serializers.ModelSerializer):
    key_pillar_name = serializers.CharField(source='key_pillar.name', read_only=True)
    key_pillar_code = serializers.CharField(source='key_pillar.code', read_only=True)

    class Meta:
        model = RMMKeyPillarWeight
        fields = ['id', 'rmm', 'key_pillar', 'key_pillar_name', 'key_pillar_code', 'weight']


class RMMSerializer(serializers.ModelSerializer):
    kp_weights = RMMKeyPillarWeightSerializer(many=True, read_only=True)

    class Meta:
        model = RiskMitigationMechanism
        fields = ['id', 'name', 'description', 'associated_risk_id', 'associated_risk_name', 'kp_weights']


class RMMCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskMitigationMechanism
        fields = ['id', 'name', 'description', 'associated_risk_id', 'associated_risk_name']


# ── Campaign ─────────────────────────────────────────────────

class ItemResponseSerializer(serializers.ModelSerializer):
    item_code = serializers.CharField(source='item.code', read_only=True)
    item_label = serializers.CharField(source='item.label', read_only=True)

    class Meta:
        model = ItemResponse
        fields = ['id', 'campaign', 'item', 'item_code', 'item_label', 'response', 'comment']


class ItemResponseBatchSerializer(serializers.Serializer):
    """For submitting multiple item responses at once"""
    campaign_id = serializers.IntegerField()
    responses = serializers.ListField(
        child=serializers.DictField()
    )


class CampaignSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    answered_items = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'organization', 'status', 'launch_date',
            'progress', 'total_items', 'answered_items',
        ]

    def get_total_items(self, obj):
        return Item.objects.count()

    def get_answered_items(self, obj):
        return obj.responses.count()

    def get_progress(self, obj):
        total = Item.objects.count()
        if total == 0:
            return 0
        answered = obj.responses.count()
        return round((answered / total) * 100, 1)


# ── Results ──────────────────────────────────────────────────

class ReadinessLevelSerializer(serializers.ModelSerializer):
    pillar_name = serializers.CharField(source='key_pillar.name', read_only=True)
    pillar_code = serializers.CharField(source='key_pillar.code', read_only=True)

    class Meta:
        model = ReadinessLevel
        fields = ['id', 'campaign', 'key_pillar', 'pillar_name', 'pillar_code', 'rmm', 'score']


class RMMCResultSerializer(serializers.ModelSerializer):
    rmm_name = serializers.CharField(source='rmm.name', read_only=True)
    associated_risk_name = serializers.CharField(source='rmm.associated_risk_name', read_only=True)

    class Meta:
        model = RMMCResult
        fields = ['id', 'campaign', 'rmm', 'rmm_name', 'associated_risk_name', 'score']


class RMCResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RMCResult
        fields = ['id', 'campaign', 'risk_id', 'risk_name', 'score']


class GPMResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPMResult
        fields = ['id', 'campaign', 'score']
