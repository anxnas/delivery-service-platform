from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.serializers import UserSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Представление для получения JWT токенов
    
    Принимает username и password и возвращает access и refresh токены.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class CustomTokenRefreshView(TokenRefreshView):
    """
    Представление для обновления JWT токенов
    
    Принимает refresh токен и возвращает новый access токен.
    """
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception:
            from rest_framework.exceptions import AuthenticationFailed
            from rest_framework import status
            raise AuthenticationFailed(
                {"detail": "Токен недействителен или просрочен"},
                code=status.HTTP_401_UNAUTHORIZED
            )

class UserProfileView(APIView):
    """
    Представление для получения информации о текущем пользователе

    Возвращает информацию о пользователе, сделавшем запрос.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)