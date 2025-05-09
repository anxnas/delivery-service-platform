from rest_framework import serializers
from api.models import Delivery


class DeliveryListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка доставок

    Содержит основную информацию о доставке для отображения в списке.
    """

    transport_model_name = serializers.CharField(source='transport_model.name', read_only=True)
    package_type_name = serializers.CharField(source='package_type.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    status_color = serializers.CharField(source='status.color', read_only=True)
    duration = serializers.FloatField(read_only=True)
    services = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Delivery
        fields = (
            'id',
            'transport_model_name',
            'transport_number',
            'departure_datetime',
            'arrival_datetime',
            'distance',
            'package_type_name',
            'status_name',
            'status_color',
            'technical_condition',
            'duration',
            'services',
            'created_at',
        )
