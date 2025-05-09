from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import DeliveryStatus
from api.serializers import DeliveryStatusSerializer
from api.schema import reference_list_schema, reference_retrieve_schema


@extend_schema(tags=['Справочники'], summary='Статусы доставки')
class DeliveryStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для статусов доставки

    Обеспечивает доступ только для чтения к статусам доставки.
    """

    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer
    permission_classes = [IsAuthenticated]

    @reference_list_schema
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @reference_retrieve_schema
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
