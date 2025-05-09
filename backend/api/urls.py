from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserProfileView,
    DeliveryViewSet,
    TransportModelViewSet,
    PackageTypeViewSet,
    DeliveryServiceViewSet,
    DeliveryStatusViewSet,
    CargoTypeViewSet,
    DeliveryAnalyticsView
)

# Создаем роутер для ViewSet
router = DefaultRouter()
router.register(r'deliveries', DeliveryViewSet)
router.register(r'transport-models', TransportModelViewSet)
router.register(r'package-types', PackageTypeViewSet)
router.register(r'services', DeliveryServiceViewSet)
router.register(r'statuses', DeliveryStatusViewSet)
router.register(r'cargo-types', CargoTypeViewSet)

urlpatterns = [
    # Авторизация
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='user_profile'),

    # Аналитика
    path('analytics/deliveries/', DeliveryAnalyticsView.as_view(), name='delivery_analytics'),

    # ViewSet маршруты
    path('', include(router.urls)),
]