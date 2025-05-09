from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import TransportModel
from api.serializers import TransportModelSerializer
from api.schema import reference_list_schema, reference_retrieve_schema


@extend_schema(tags=['Справочники'], summary='Модели транспорта')
class TransportModelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для моделей транспорта

    Обеспечивает доступ только для чтения к моделям транспорта.
    """

    queryset = TransportModel.objects.all()
    serializer_class = TransportModelSerializer
    permission_classes = [IsAuthenticated]

    @reference_list_schema
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @reference_retrieve_schema
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
