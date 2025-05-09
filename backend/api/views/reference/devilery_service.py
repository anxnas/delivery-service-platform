from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import DeliveryService
from api.serializers import DeliveryServiceSerializer


class DeliveryServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для услуг доставки

    Обеспечивает доступ только для чтения к услугам доставки.
    """

    queryset = DeliveryService.objects.all()
    serializer_class = DeliveryServiceSerializer
    permission_classes = [IsAuthenticated]
