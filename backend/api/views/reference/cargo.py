from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import CargoType
from api.serializers import CargoTypeSerializer

class CargoTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для типов груза

    Обеспечивает доступ только для чтения к типам груза.
    """

    queryset = CargoType.objects.all()
    serializer_class = CargoTypeSerializer
    permission_classes = [IsAuthenticated]
