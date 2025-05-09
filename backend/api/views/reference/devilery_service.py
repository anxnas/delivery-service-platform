from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import DeliveryService
from api.serializers import DeliveryServiceSerializer
from api.schema import reference_list_schema, reference_retrieve_schema


@extend_schema(tags=['Справочники'], summary='Услуги доставки')
class DeliveryServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для услуг доставки

    Обеспечивает доступ только для чтения к услугам доставки.
    """

    queryset = DeliveryService.objects.all()
    serializer_class = DeliveryServiceSerializer
    permission_classes = [IsAuthenticated]

    @reference_list_schema
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @reference_retrieve_schema
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
