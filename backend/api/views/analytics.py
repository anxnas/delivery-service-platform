from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from api.models import Delivery
from api.schema import analytics_schema


@extend_schema(tags=['Аналитика'])
class DeliveryAnalyticsView(APIView):
    """
    Представление для аналитики доставок

    Возвращает статистику по доставкам для отображения на графиках.
    """

    permission_classes = [IsAuthenticated]

    @analytics_schema
    def get(self, request):
        # Получаем параметры фильтрации
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        service_ids = request.query_params.get('services')
        cargo_type_ids = request.query_params.get('cargo_types')

        # Базовый запрос
        query = Delivery.objects.all()

        # Применяем фильтры
        if start_date:
            query = query.filter(arrival_datetime__date__gte=start_date)

        if end_date:
            query = query.filter(arrival_datetime__date__lte=end_date)

        if service_ids:
            service_ids = service_ids.split(',')
            query = query.filter(services__id__in=service_ids).distinct()

        if cargo_type_ids:
            cargo_type_ids = cargo_type_ids.split(',')
            query = query.filter(cargo_type__id__in=cargo_type_ids).distinct()

        # Статистика по дням
        daily_stats = query.annotate(
            date=TruncDate('arrival_datetime')
        ).values('date').annotate(
            count=Count('id'),
            total_distance=Sum('distance'),
            avg_distance=Avg('distance')
        ).order_by('date')

        # Статистика по статусам
        status_stats = query.values('status__name', 'status__color').annotate(
            count=Count('id')
        ).order_by('-count')

        # Статистика по моделям транспорта
        transport_stats = query.values('transport_model__name').annotate(
            count=Count('id')
        ).order_by('-count')

        # Статистика по услугам
        service_stats = query.values('services__name').annotate(
            count=Count('id', distinct=True)
        ).order_by('-count')

        # Общая статистика
        total_deliveries = query.count()
        total_distance = query.aggregate(Sum('distance'))['distance__sum'] or 0

        return Response({
            'daily_stats': list(daily_stats),
            'status_stats': list(status_stats),
            'transport_stats': list(transport_stats),
            'service_stats': list(service_stats),
            'total_deliveries': total_deliveries,
            'total_distance': total_distance
        })
