from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from api.serializers import UserSerializer


class UserProfileView(APIView):
    """
    Представление для получения информации о текущем пользователе

    Возвращает информацию о пользователе, сделавшем запрос.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)