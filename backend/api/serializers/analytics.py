from rest_framework import serializers


class AnalyticsDailySerializer(serializers.Serializer):
    """
    Сериализатор для ежедневной статистики доставок
    """
    date = serializers.DateField()
    count = serializers.IntegerField()
    total_distance = serializers.FloatField()
    avg_distance = serializers.FloatField()


class AnalyticsStatusSerializer(serializers.Serializer):
    """
    Сериализатор для статистики по статусам доставок
    """
    status__name = serializers.CharField()
    status__color = serializers.CharField()
    count = serializers.IntegerField()


class AnalyticsTransportSerializer(serializers.Serializer):
    """
    Сериализатор для статистики по транспортным моделям
    """
    transport_model__name = serializers.CharField()
    count = serializers.IntegerField()


class AnalyticsServiceSerializer(serializers.Serializer):
    """
    Сериализатор для статистики по услугам доставки
    """
    services__name = serializers.CharField()
    count = serializers.IntegerField()


class DeliveryAnalyticsSerializer(serializers.Serializer):
    """
    Сериализатор для полной аналитики доставок
    """
    daily_stats = AnalyticsDailySerializer(many=True)
    status_stats = AnalyticsStatusSerializer(many=True)
    transport_stats = AnalyticsTransportSerializer(many=True)
    service_stats = AnalyticsServiceSerializer(many=True)
    total_deliveries = serializers.IntegerField()
    total_distance = serializers.FloatField()