from django.http import Http404
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import CargoType
from api.serializers import CargoTypeSerializer


class CargoTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Представление для типов груза

    Обеспечивает доступ только для чтения к типам груза.
    """

    queryset = CargoType.objects.all()
    serializer_class = CargoTypeSerializer
    permission_classes = [IsAuthenticated]

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
