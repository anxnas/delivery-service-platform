from rest_framework import serializers
from api.models import DeliveryStatus


class DeliveryStatusSerializer(serializers.ModelSerializer):
    """
    Сериализатор для статусов доставки

    Преобразует модель DeliveryStatus в JSON и обратно.
    """

    class Meta:
        model = DeliveryStatus
        fields = ('id', 'name', 'code', 'color', 'description')
