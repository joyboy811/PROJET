from rest_framework.routers import DefaultRouter
from .views import (
    RiskViewSet, IndicatorViewSet, IndicatorValueViewSet,
    RiskScoreViewSet, RMMViewSet, KeyPillarViewSet,
    RMMKeyPillarWeightViewSet
)

router = DefaultRouter()
router.register(r'risks',            RiskViewSet)
router.register(r'indicators',       IndicatorViewSet)
router.register(r'indicator-values', IndicatorValueViewSet)
router.register(r'risk-scores',      RiskScoreViewSet)
router.register(r'rmms',             RMMViewSet)
router.register(r'key-pillars',      KeyPillarViewSet)
router.register(r'rmm-kp-weights',   RMMKeyPillarWeightViewSet)

urlpatterns = router.urls