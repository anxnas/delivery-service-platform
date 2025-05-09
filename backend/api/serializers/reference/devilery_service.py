from rest_framework import serializers
from api.models import DeliveryService


class DeliveryServiceSerializer(serializers.ModelSerializer):
    """
    Сериализатор для услуг доставки

    Преобразует модель DeliveryService в JSON и обратно.
    """

    class Meta:
        model = DeliveryService
        fields = ('id', 'name', 'description')
