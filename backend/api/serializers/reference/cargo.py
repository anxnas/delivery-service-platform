from rest_framework import serializers
from api.models import CargoType


class CargoTypeSerializer(serializers.ModelSerializer):
    """
    Сериализатор для типов груза

    Преобразует модель CargoType в JSON и обратно.
    """

    class Meta:
        model = CargoType
        fields = ('id', 'name', 'description')
