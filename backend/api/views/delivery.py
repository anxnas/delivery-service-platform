from datetime import timedelta
from django.db.models import Q, F
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from api.models import Delivery, DeliveryStatus
from api.serializers import DeliveryListSerializer, DeliveryDetailSerializer
from api.schema import (
    delivery_list_schema,
    delivery_retrieve_schema,
    delivery_create_schema,
    delivery_update_schema,
    delivery_partial_update_schema,
    delivery_delete_schema,
    delivery_complete_schema
)


@extend_schema(tags=['Доставки'])
class DeliveryViewSet(viewsets.ModelViewSet):
    """
    Представление для работы с доставками

    Обеспечивает полный CRUD для доставок.
    """

    queryset = Delivery.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'transport_model', 'package_type', 'technical_condition']
    ordering_fields = ['departure_datetime', 'arrival_datetime', 'distance', 'created_at']
    ordering = ['-departure_datetime']
    search_fields = ['transport_number', 'departure_address', 'arrival_address']

    def get_serializer_class(self):
        if self.action == 'list':
            return DeliveryListSerializer
        return DeliveryDetailSerializer

    @delivery_list_schema
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @delivery_retrieve_schema
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @delivery_create_schema
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @delivery_update_schema
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @delivery_partial_update_schema
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @delivery_delete_schema
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @delivery_complete_schema
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Действие для завершения доставки

        Изменяет статус доставки на "Проведено".
        """
        delivery = self.get_object()
        completed_status = DeliveryStatus.objects.filter(code=DeliveryStatus.Status.COMPLETED).first()

        if not completed_status:
            return Response(
                {"error": "Статус 'Проведено' не найден в базе данных"},
                status=status.HTTP_400_BAD_REQUEST
            )

        delivery.status = completed_status
        delivery.save()

        serializer = self.get_serializer(delivery)
        return Response(serializer.data)

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)

        # Дополнительная фильтрация по времени в пути
        min_duration = self.request.query_params.get('min_duration')
        max_duration = self.request.query_params.get('max_duration')

        if min_duration:
            # Фильтрация по минимальной продолжительности (в часах)
            try:
                min_duration = float(min_duration)
                queryset = queryset.filter(
                    arrival_datetime__gte=F('departure_datetime') +
                                          timedelta(hours=min_duration)
                )
            except (ValueError, TypeError):
                pass

        if max_duration:
            # Фильтрация по максимальной продолжительности (в часах)
            try:
                max_duration = float(max_duration)
                queryset = queryset.filter(
                    arrival_datetime__lte=F('departure_datetime') +
                                          timedelta(hours=max_duration)
                )
            except (ValueError, TypeError):
                pass

        # Фильтрация по диапазону дат доставки
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(arrival_datetime__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(arrival_datetime__date__lte=end_date)

        # Фильтрация по услугам
        services = self.request.query_params.get('services')
        if services:
            service_ids = services.split(',')
            queryset = queryset.filter(services__id__in=service_ids).distinct()

        return queryset
