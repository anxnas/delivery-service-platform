from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import TransportModel
from api.serializers import TransportModelSerializer


class TransportModelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для моделей транспорта

    Обеспечивает доступ только для чтения к моделям транспорта.
    """

    queryset = TransportModel.objects.all()
    serializer_class = TransportModelSerializer
    permission_classes = [IsAuthenticated]
