from rest_framework import serializers
from api.models import Delivery, TransportModel, PackageType, DeliveryService, DeliveryStatus


class DeliveryDetailSerializer(serializers.ModelSerializer):
    """
    Сериализатор для детальной информации о доставке

    Содержит полную информацию о доставке.
    """

    transport_model = serializers.PrimaryKeyRelatedField(queryset=TransportModel.objects.all())
    package_type = serializers.PrimaryKeyRelatedField(queryset=PackageType.objects.all())
    status = serializers.PrimaryKeyRelatedField(queryset=DeliveryStatus.objects.all())
    services = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryService.objects.all(),
        many=True
    )
    duration = serializers.FloatField(read_only=True)

    class Meta:
        model = Delivery
        fields = (
            'id',
            'transport_model',
            'transport_number',
            'departure_datetime',
            'arrival_datetime',
            'distance',
            'departure_address',
            'arrival_address',
            'media_file',
            'package_type',
            'status',
            'technical_condition',
            'services',
            'duration',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')
