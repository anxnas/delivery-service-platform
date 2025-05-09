from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import DeliveryStatus
from api.serializers import DeliveryStatusSerializer


class DeliveryStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для статусов доставки

    Обеспечивает доступ только для чтения к статусам доставки.
    """

    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer
    permission_classes = [IsAuthenticated]
