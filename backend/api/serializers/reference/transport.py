from rest_framework import serializers
from api.models import TransportModel


class TransportModelSerializer(serializers.ModelSerializer):
    """
    Сериализатор для моделей транспорта

    Преобразует модель TransportModel в JSON и обратно.
    """

    class Meta:
        model = TransportModel
        fields = ('id', 'name', 'description')
