from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import CargoType
from api.serializers import CargoTypeSerializer
from api.schema import reference_list_schema, reference_retrieve_schema


@extend_schema(tags=['Справочники'], summary='Типы груза')
class CargoTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для типов груза

    Обеспечивает доступ только для чтения к типам груза.
    """

    queryset = CargoType.objects.all()
    serializer_class = CargoTypeSerializer
    permission_classes = [IsAuthenticated]

    @reference_list_schema
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @reference_retrieve_schema
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
