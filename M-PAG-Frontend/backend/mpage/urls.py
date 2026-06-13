from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from . import ipage_views

router = DefaultRouter()
router.register(r'pillars',      views.KeyPillarViewSet)
router.register(r'dimensions',   views.DimensionViewSet)
router.register(r'factors',      views.FactorViewSet)
router.register(r'items',        views.ItemViewSet)
router.register(r'rmms',         views.RMMViewSet)
router.register(r'rmm-weights',  views.RMMKeyPillarWeightViewSet)
router.register(r'campaigns',    views.CampaignViewSet)
router.register(r'responses',    views.ItemResponseViewSet)
router.register(r'readiness-levels', views.ReadinessLevelViewSet)
router.register(r'rmmc-results', views.RMMCResultViewSet)
router.register(r'rmc-results',  views.RMCResultViewSet)
router.register(r'gpm-results',  views.GPMResultViewSet)
router.register(r'users',        views.UserViewSet)

# I-PAGe routes
router.register(r'ipage/indicators',  ipage_views.IPageIndicatorViewSet)
router.register(r'ipage/mechanisms',  ipage_views.IPageMechanismViewSet)
router.register(r'ipage/scenarios',   ipage_views.IPageScenarioViewSet)
router.register(r'ipage/simulations', ipage_views.IPageSimulationViewSet)

urlpatterns = [
    # Auth
    path('auth/login/',  views.login_view,  name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/',     views.me_view,     name='me'),

    # Batch operations
    path('batch-responses/', views.batch_responses, name='batch-responses'),

    # O-PAGe proxy
    path('opage/risks/',           views.opage_risks,           name='opage-risks'),
    path('opage/risks/<int:pk>/',  views.opage_risk_detail,      name='opage-risk-detail'),
    path('opage/key-pillars/',     views.opage_key_pillars,      name='opage-key-pillars'),
    path('opage/key-pillars/<int:pk>/', views.opage_key_pillar_detail, name='opage-key-pillar-detail'),
    path('opage/risk-scores/',     views.opage_risk_scores,      name='opage-risk-scores'),
    path('opage/indicators/',      views.opage_indicators,       name='opage-indicators'),
    path('opage/indicators/<int:pk>/', views.opage_indicator_detail, name='opage-indicator-detail'),
    path('opage/indicator-values/', views.opage_indicator_values, name='opage-indicator-values'),

    # I-PAGe bootstrap
    path('ipage/bootstrap/', ipage_views.ipage_bootstrap, name='ipage-bootstrap'),
] + router.urls

