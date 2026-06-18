import requests
import pandas as pd
from django.db.models import Q
from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, action, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import (
    KeyPillar, Dimension, Factor, Item,
    RiskMitigationMechanism, RMMKeyPillarWeight,
    Campaign, ItemResponse,
    ReadinessLevel, RMMCResult, RMCResult, GPMResult,
    Project, UserProfile,
)
from .models_admin import SystemAdmin
from .serializers import (
    UserSerializer, KeyPillarSerializer, KeyPillarListSerializer,
    UserCreateUpdateSerializer, SystemAdminSerializer,
    DimensionSerializer, FactorSerializer, ItemSerializer,
    RMMSerializer, RMMCreateSerializer, RMMKeyPillarWeightSerializer,
    CampaignSerializer, ItemResponseSerializer,
    ReadinessLevelSerializer, RMMCResultSerializer,
    RMCResultSerializer, GPMResultSerializer,
    ProjectSerializer,
)
from .calculations import run_full_calculation
from django.contrib.auth.models import Group
from rest_framework.permissions import BasePermission, IsAuthenticated
import logging

logger = logging.getLogger(__name__)


def get_user_project_id(request):
    """Extract project_id from the authenticated user's profile. Returns None for system_admin."""
    if request.session.get('system_admin_id'):
        return None
    user = request.user
    if not user or not user.is_authenticated:
        return None
    try:
        return user.profile.project_id
    except UserProfile.DoesNotExist:
        return None


class ProjectFilterMixin:
    """Filter queryset by the connected user's project. System admins see all."""
    project_field = 'project'  # override in subclass if needed

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = get_user_project_id(self.request)
        if project_id is not None:
            qs = qs.filter(**{self.project_field: project_id})
        return qs

    def perform_create(self, serializer):
        project_id = get_user_project_id(self.request)
        if project_id is not None:
            serializer.save(project_id=project_id)
        else:
            serializer.save()


class IsSystemAdmin(BasePermission):
    """Only system_admin (separate model) can access."""
    def has_permission(self, request, view):
        return bool(request.session.get('system_admin_id'))


class ProjectViewSet(viewsets.ModelViewSet):
    """CRUD for projects - system_admin only."""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsSystemAdmin]


# Permission: only superuser or users in group 'administrateur' can manage users
class IsOrganisateurAdmin(BasePermission):
    def has_permission(self, request, view):
        # Debug: log cookies/session/user to troubleshoot 403 issues
        try:
            logger.debug("IsOrganisateurAdmin: COOKIES=%s SESSION_KEYS=%s USER=%s AUTH=%s HTTP_COOKIE=%s",
                         dict(request.COOKIES), list(request.session.keys()),
                         getattr(request.user, 'username', None), getattr(request.user, 'is_authenticated', False),
                         request.META.get('HTTP_COOKIE'))
            # Also print to stdout to ensure visibility in container logs
            try:
                print("DEBUG IsOrganisateurAdmin: COOKIES=", dict(request.COOKIES))
                print("DEBUG IsOrganisateurAdmin: SESSION_KEYS=", list(request.session.keys()))
                print("DEBUG IsOrganisateurAdmin: USER=", getattr(request.user, 'username', None), "AUTH=", getattr(request.user, 'is_authenticated', False))
                print("DEBUG IsOrganisateurAdmin: HTTP_COOKIE=", request.META.get('HTTP_COOKIE'))
            except Exception:
                print("DEBUG IsOrganisateurAdmin: failed to print debug info")
        except Exception:
            logger.exception("Failed to log request debug info in IsOrganisateurAdmin")

        # Allow system_admin session (separate model) to access admin endpoints
        if request.session.get('system_admin_id'):
            logger.debug('IsOrganisateurAdmin: allowed via system_admin_id=%s', request.session.get('system_admin_id'))
            return True

        user = request.user
        if not user or not user.is_authenticated:
            logger.debug('IsOrganisateurAdmin: denied - no authenticated user')
            return False
        if user.is_superuser:
            logger.debug('IsOrganisateurAdmin: allowed - user is superuser')
            return True
        is_admin = user.groups.filter(name='administrateur').exists()
        logger.debug('IsOrganisateurAdmin: allowed_via_group=%s', is_admin)
        return is_admin

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


# ── Auth Views ───────────────────────────────────────────────

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    """Session-based login - supports both SystemAdmin and regular User"""
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    
    # Try SystemAdmin first
    try:
        system_admin = SystemAdmin.objects.get(username=username)
        if system_admin.check_password(password):
            request.session['system_admin_id'] = system_admin.id
            request.session['system_admin_username'] = system_admin.username
            return Response({
                'id': system_admin.id,
                'username': system_admin.username,
                'email': system_admin.email,
                'first_name': system_admin.first_name,
                'last_name': system_admin.last_name,
                'role': 'system_admin',
            })
    except SystemAdmin.DoesNotExist:
        pass
    
    # Try regular User
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response(UserSerializer(user).data)
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def logout_view(request):
    """Session logout - handles both SystemAdmin and User sessions"""
    request.session.pop('system_admin_id', None)
    request.session.pop('system_admin_username', None)
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([AllowAny])
def me_view(request):
    """Get current authenticated user - supports both SystemAdmin and User"""
    
    # Check if SystemAdmin is logged in
    system_admin_id = request.session.get('system_admin_id')
    if system_admin_id:
        try:
            system_admin = SystemAdmin.objects.get(id=system_admin_id)
            return Response(SystemAdminSerializer(system_admin).data)
        except SystemAdmin.DoesNotExist:
            pass
    
    # Check if regular User is logged in
    if request.user.is_authenticated:
        data = UserSerializer(request.user).data
        # Include project info
        try:
            profile = request.user.profile
            if profile.project:
                data['project'] = {'id': profile.project.id, 'name': profile.project.name}
            else:
                data['project'] = None
        except UserProfile.DoesNotExist:
            data['project'] = None
        return Response(data)
    
    return Response({'user': None}, status=status.HTTP_401_UNAUTHORIZED)


# ── Hierarchy ViewSets ───────────────────────────────────────

class KeyPillarViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = KeyPillar.objects.prefetch_related(
        'dimensions__factors__items'
    ).all()
    serializer_class = KeyPillarSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        pillar_id = self.request.query_params.get('pillar')
        if pillar_id:
            qs = qs.filter(id=pillar_id)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            # Check query param for detail level
            if self.request.query_params.get('detail') == 'full':
                return KeyPillarSerializer
            return KeyPillarListSerializer
        return KeyPillarSerializer


class DimensionViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = Dimension.objects.prefetch_related('factors__items').all()
    serializer_class = DimensionSerializer
    project_field = 'pillar__project'

    def get_queryset(self):
        qs = super().get_queryset()
        pillar_id = self.request.query_params.get('pillar')
        if pillar_id:
            qs = qs.filter(pillar_id=pillar_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class FactorViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = Factor.objects.prefetch_related('items').all()
    serializer_class = FactorSerializer
    project_field = 'dimension__pillar__project'

    def get_queryset(self):
        qs = super().get_queryset()
        dimension_id = self.request.query_params.get('dimension')
        if dimension_id:
            qs = qs.filter(dimension_id=dimension_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class ItemViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    project_field = 'factor__dimension__pillar__project'

    def get_queryset(self):
        qs = super().get_queryset()
        factor_id = self.request.query_params.get('factor')
        if factor_id:
            qs = qs.filter(factor_id=factor_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


# ── RMM ViewSets ─────────────────────────────────────────────

class RMMViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = RiskMitigationMechanism.objects.prefetch_related('kp_weights').all()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return RMMCreateSerializer
        return RMMSerializer

    @action(detail=True, methods=['post'])
    def configure_weights(self, request, pk=None):
        """
        Set KP weights for a mechanism.
        Expects: {"weights": [{"key_pillar_id": 1, "weight": 0.2}, ...]}
        """
        rmm = self.get_object()
        weights_data = request.data.get('weights', [])

        for w in weights_data:
            RMMKeyPillarWeight.objects.update_or_create(
                rmm=rmm,
                key_pillar_id=w['key_pillar_id'],
                defaults={'weight': w['weight']},
            )

        rmm.refresh_from_db()
        return Response(RMMSerializer(rmm).data)


class RMMKeyPillarWeightViewSet(viewsets.ModelViewSet):
    queryset = RMMKeyPillarWeight.objects.all()
    serializer_class = RMMKeyPillarWeightSerializer


# ── Campaign ViewSets ────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class CampaignViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=['post'])
    def compute(self, request, pk=None):
        """Trigger full M-PAGe calculation for this campaign"""
        campaign = self.get_object()
        results = run_full_calculation(campaign.id)
        campaign.status = 'completed'
        campaign.save()
        return Response(results)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all computed results for a campaign"""
        campaign = self.get_object()

        if not campaign.responses.exists():
            return Response({
                'campaign': CampaignSerializer(campaign).data,
                'readiness_levels': [],
                'rmmc': [],
                'rmc': [],
                'gpm': [],
            })

        non_legacy_pillar_ids = set(
            KeyPillar.objects.exclude(code__in=LEGACY_PILLAR_CODES)
            .values_list('id', flat=True)
        )
        existing_rl_pillar_ids = set(
            campaign.readiness_levels.filter(rmm=None)
            .values_list('key_pillar_id', flat=True)
        )

        if non_legacy_pillar_ids - existing_rl_pillar_ids:
            run_full_calculation(campaign.id)
            campaign.refresh_from_db()

        return Response({
            'campaign': CampaignSerializer(campaign).data,
            'readiness_levels': ReadinessLevelSerializer(
                campaign.readiness_levels.filter(rmm=None).exclude(
                    key_pillar__code__in=LEGACY_PILLAR_CODES
                ), many=True
            ).data,
            'rmmc': RMMCResultSerializer(
                campaign.rmmc_results.all(), many=True
            ).data,
            'rmc': RMCResultSerializer(
                campaign.rmc_results.all(), many=True
            ).data,
            'gpm': GPMResultSerializer(
                campaign.gpm_results.all(), many=True
            ).data,
        })

    @action(detail=True, methods=['get'])
    def export_template(self, request, pk=None):
        campaign = self.get_object()
        items = Item.objects.select_related('factor__dimension__pillar').all()
        
        data = []
        for item in items:
            data.append({
                'Dimension': item.factor.dimension.name,
                'Factor Code': item.factor.code,
                'Question Code': item.code,
                'Question / Item (score 1-5)': item.label,
                'Resp1': '',
                'Resp2': '',
                'Resp3': '',
                'Resp4': '',
                'Resp5': '',
            })
            
        df = pd.DataFrame(data)
        
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="Template_Campaign_{campaign.id}.xlsx"'
        
        # Write to excel
        df.to_excel(response, index=False, engine='openpyxl')
        return response

    @csrf_exempt
    @action(detail=True, methods=['post'])
    def import_responses(self, request, pk=None):
        print(f"DEBUG: Import attempt for campaign {pk}")
        campaign = self.get_object()
        
        if 'file' not in request.FILES:
            print("DEBUG: No file in request.FILES")
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        uploaded_file = request.FILES['file']
        filename = uploaded_file.name.lower()
        print(f"DEBUG: Received file: {filename}")
        
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
            print(f"DEBUG: File read successfully. Columns: {list(df.columns)}")
        except Exception as e:
            print(f"DEBUG: Error reading file: {str(e)}")
            return Response({'error': f'File read error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Ensure we have the required 'Question Code' column
        # Try both 'Question Code' and 'Question Code' with spaces
        col_map = {str(c).strip(): c for c in df.columns}
        q_code_col = None
        if 'Question Code' in col_map:
            q_code_col = col_map['Question Code']
        
        if not q_code_col:
            print(f"DEBUG: Missing 'Question Code' column. Found: {list(df.columns)}")
            return Response({'error': 'Missing "Question Code" column in the file.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find all columns that start with 'Resp' (case insensitive and strip)
        resp_cols = [c for c in df.columns if str(c).strip().lower().startswith('resp')]
        
        if not resp_cols:
            print("DEBUG: No columns starting with 'Resp' found.")
            return Response({'error': 'No response columns found (must start with "Resp").'}, status=status.HTTP_400_BAD_REQUEST)
            
        items_map = {item.code: item for item in Item.objects.all()}
        created_count = 0
        
        for _, row in df.iterrows():
            q_code = str(row[q_code_col]).strip()
            item = items_map.get(q_code)
            if not item:
                continue
                
            # Extract raw data
            raw_data = {}
            valid_scores = []
            for col in resp_cols:
                val = row[col]
                if pd.notna(val) and str(val).strip() != '':
                    try:
                        num_val = float(val)
                        if 1 <= num_val <= 5:
                            raw_data[col] = num_val
                            valid_scores.append(num_val)
                    except (ValueError, TypeError):
                        pass
                        
            if not valid_scores:
                continue
                
            avg_score = sum(valid_scores) / len(valid_scores)
            
            ItemResponse.objects.update_or_create(
                campaign=campaign,
                item=item,
                defaults={
                    'response': avg_score,
                    'raw_data': raw_data
                }
            )
            created_count += 1
            
        print(f"DEBUG: Successfully imported {created_count} responses.")
        
        # Update campaign status
        total_items = Item.objects.count()
        answered = campaign.responses.count()
        if answered > 0 and campaign.status == 'draft':
            campaign.status = 'in_progress'
            campaign.save()
            
        return Response({
            'message': f'Import successful: {created_count} responses processed.',
            'answered': answered,
            'total_items': total_items,
            'progress': round((answered / total_items) * 100, 1) if total_items else 0,
        })


class ItemResponseViewSet(ProjectFilterMixin, viewsets.ModelViewSet):
    queryset = ItemResponse.objects.all()
    serializer_class = ItemResponseSerializer
    project_field = 'campaign__project'

    def get_queryset(self):
        qs = super().get_queryset()
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            qs = qs.filter(campaign_id=campaign_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    # choose serializer dynamically
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return UserCreateUpdateSerializer
        return UserSerializer

    permission_classes = [IsOrganisateurAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        # Exclude system admin accounts from the regular user list
        from .models_admin import SystemAdmin
        admin_usernames = list(SystemAdmin.objects.values_list('username', flat=True))
        qs = qs.exclude(is_superuser=True)
        if admin_usernames:
            qs = qs.exclude(username__in=admin_usernames)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(username__icontains=q) |
                Q(email__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q)
            )
        return qs


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def batch_responses(request):
    """
    Submit multiple item responses at once.
    Body: {"campaign_id": 1, "responses": [{"item_id": 1, "response": 4, "comment": "..."}, ...]}
    """
    campaign_id = request.data.get('campaign_id')
    responses_data = request.data.get('responses', [])

    created = []
    for r in responses_data:
        obj, _ = ItemResponse.objects.update_or_create(
            campaign_id=campaign_id,
            item_id=r['item_id'],
            defaults={
                'response': r['response'],
                'comment': r.get('comment', ''),
            },
        )
        created.append(obj)

    # Update campaign status
    campaign = Campaign.objects.get(id=campaign_id)
    total_items = Item.objects.count()
    answered = campaign.responses.count()
    if answered > 0 and campaign.status == 'draft':
        campaign.status = 'in_progress'
        campaign.save()

    return Response({
        'saved': len(created),
        'total_items': total_items,
        'answered': answered,
        'progress': round((answered / total_items) * 100, 1) if total_items else 0,
    })


# ── Results ViewSets ─────────────────────────────────────────

class ReadinessLevelViewSet(ProjectFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = ReadinessLevel.objects.all()
    serializer_class = ReadinessLevelSerializer
    project_field = 'campaign__project'

    def get_queryset(self):
        qs = super().get_queryset()
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            qs = qs.filter(campaign_id=campaign_id)
        return qs


class RMMCResultViewSet(ProjectFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = RMMCResult.objects.all()
    serializer_class = RMMCResultSerializer
    project_field = 'campaign__project'


class RMCResultViewSet(ProjectFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = RMCResult.objects.all()
    serializer_class = RMCResultSerializer
    project_field = 'campaign__project'


class GPMResultViewSet(ProjectFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = GPMResult.objects.all()
    serializer_class = GPMResultSerializer
    project_field = 'campaign__project'


# ── O-PAGe Proxy ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
def opage_risks(request):
    """
    Proxy view to fetch or create risks via the O-PAGe API.
    """
    try:
        url = f"{settings.OPAGE_API_URL}/risks/"
        project_id = get_user_project_id(request)
        if request.method == 'POST':
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            if project_id:
                data['project_id'] = project_id
            resp = requests.post(url, json=data, timeout=5)
        else:
            params = dict(request.query_params)
            if project_id:
                params['project_id'] = project_id
            resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'POST'])
def opage_key_pillars(request):
    """
    Proxy view to list or create key pillars via the O-PAGe API.
    """
    try:
        url = f"{settings.OPAGE_API_URL}/key-pillars/"
        project_id = get_user_project_id(request)
        if request.method == 'POST':
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            if project_id:
                data['project_id'] = project_id
            resp = requests.post(url, json=data, timeout=5)
        else:
            params = dict(request.query_params)
            if project_id:
                params['project_id'] = project_id
            resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def normalize_value(value):
    if isinstance(value, str):
        return value.strip().lower()
    return ''


def normalize_code(value):
    return normalize_value(value).replace(' ', '-')


def delete_local_opage_pillars(pillar_data):
    normalized_type = normalize_value(pillar_data.get('type'))
    normalized_name = normalize_value(pillar_data.get('name'))
    normalized_code = normalize_code(normalized_type)
    normalized_name_code = normalize_code(normalized_name)

    local_query = KeyPillar.objects.exclude(code__in=LEGACY_PILLAR_CODES).exclude(pillar_type__in=LEGACY_PILLAR_CODES)

    filters = Q()
    if normalized_type:
        filters |= Q(pillar_type=normalized_type)
        filters |= Q(code=normalized_code)
    if normalized_name:
        filters |= Q(name=normalized_name)
        filters |= Q(code=normalized_name_code)

    if not filters:
        return 0

    deleted_count, _ = local_query.filter(filters).delete()
    return deleted_count


@api_view(['GET', 'PATCH', 'DELETE'])
def opage_key_pillar_detail(request, pk):
    """
    Proxy view to retrieve, update or delete a key pillar via the O-PAGe API.
    """
    try:
        url = f"{settings.OPAGE_API_URL}/key-pillars/{pk}/"
        if request.method == 'PATCH':
            resp = requests.patch(url, json=request.data, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
        elif request.method == 'DELETE':
            details_resp = requests.get(url, timeout=5)
            details_resp.raise_for_status()
            pillar_data = details_resp.json()

            resp = requests.delete(url, timeout=5)
            resp.raise_for_status()

            delete_local_opage_pillars(pillar_data)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
def opage_risk_scores(request):
    """Proxy to fetch risk scores from O-PAGe"""
    try:
        url = f"{settings.OPAGE_API_URL}/risk-scores/"
        params = dict(request.query_params)
        project_id = get_user_project_id(request)
        if project_id:
            params['project_id'] = project_id
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'POST'])
def opage_indicators(request):
    """Proxy view for O-PAGe indicators"""
    try:
        url = f"{settings.OPAGE_API_URL}/indicators/"
        project_id = get_user_project_id(request)
        if request.method == 'POST':
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            if project_id:
                data['project_id'] = project_id
            resp = requests.post(url, json=data, timeout=5)
        else:
            params = dict(request.query_params)
            if project_id:
                params['project_id'] = project_id
            resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'POST'])
def opage_indicator_values(request):
    """Proxy view for O-PAGe indicator values"""
    try:
        url = f"{settings.OPAGE_API_URL}/indicator-values/"
        project_id = get_user_project_id(request)
        if request.method == 'POST':
            resp = requests.post(url, json=request.data, timeout=5)
        else:
            params = dict(request.query_params)
            if project_id:
                params['project_id'] = project_id
            resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'PATCH', 'DELETE'])
def opage_risk_detail(request, pk):
    """
    Proxy view to retrieve, update or delete a single risk via the O-PAGe API.
    """
    try:
        url = f"{settings.OPAGE_API_URL}/risks/{pk}/"
        if request.method == 'PATCH':
            resp = requests.patch(url, json=request.data, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
        elif request.method == 'DELETE':
            resp = requests.delete(url, timeout=5)
            resp.raise_for_status()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'PATCH', 'DELETE'])
def opage_indicator_detail(request, pk):
    """
    Proxy view to retrieve, update or delete a single indicator via the O-PAGe API.
    """
    try:
        url = f"{settings.OPAGE_API_URL}/indicators/{pk}/"
        if request.method == 'PATCH':
            resp = requests.patch(url, json=request.data, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
        elif request.method == 'DELETE':
            resp = requests.delete(url, timeout=5)
            resp.raise_for_status()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            return Response(resp.json())
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to O-PAGe. Ensure the service is running.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {'error': f'Error connecting to O-PAGe: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
