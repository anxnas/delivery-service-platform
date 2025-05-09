from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import PackageType
from api.serializers import PackageTypeSerializer


class PackageTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для типов упаковки

    Обеспечивает доступ только для чтения к типам упаковки.
    """

    queryset = PackageType.objects.all()
    serializer_class = PackageTypeSerializer
    permission_classes = [IsAuthenticated]
