from datetime import timedelta
from django.db.models import Q, F
from django.http import Http404
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from api.models import Delivery, DeliveryStatus
from api.serializers import DeliveryListSerializer, DeliveryDetailSerializer



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

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Http404:
            return Response(
                {"detail": "Страница не найдена."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Http404:
            return Response(
                {"detail": "Страница не найдена."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def partial_update(self, request, *args, **kwargs):
        try:
            return super().partial_update(request, *args, **kwargs)
        except Http404:
            return Response(
                {"detail": "Страница не найдена."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Http404:
            return Response(
                {"detail": "Страница не найдена."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Действие для завершения доставки

        Изменяет статус доставки на "Проведено".
        """
        try:
            delivery = self.get_object()
        except Http404:
            return Response(
                {"detail": "Страница не найдена."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Изменяем поиск по имени вместо кода
        completed_status = DeliveryStatus.objects.filter(name="Проведено").first()
        if not completed_status:
            return Response(
                {"detail": "Статус 'Проведено' не найден в базе данных"},
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
