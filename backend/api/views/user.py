from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema
from api.schema import user_profile_schema, token_obtain_schema, token_refresh_schema
from api.serializers import UserSerializer


@extend_schema(tags=['Авторизация'])
class CustomTokenObtainPairView(TokenObtainPairView):
    @token_obtain_schema
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

@extend_schema(tags=['Авторизация'])
class CustomTokenRefreshView(TokenRefreshView):
    @token_refresh_schema
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

@extend_schema(tags=['Авторизация'])
class UserProfileView(APIView):
    """
    Представление для получения информации о текущем пользователе

    Возвращает информацию о пользователе, сделавшем запрос.
    """

    permission_classes = [IsAuthenticated]

    @user_profile_schema
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)