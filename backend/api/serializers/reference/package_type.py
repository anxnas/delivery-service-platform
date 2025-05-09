from rest_framework import serializers
from api.models import PackageType


class PackageTypeSerializer(serializers.ModelSerializer):
    """
    Сериализатор для типов упаковки

    Преобразует модель PackageType в JSON и обратно.
    """

    class Meta:
        model = PackageType
        fields = ('id', 'name', 'description')
