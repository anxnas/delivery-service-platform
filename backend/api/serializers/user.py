from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Кастомный сериализатор для получения JWT токенов
    """
    pass


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Кастомный сериализатор для обновления JWT токенов
    """
    pass

class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для пользователей

    Содержит основную информацию о пользователе.
    """

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
        read_only_fields = ('id', 'is_staff', 'date_joined')
        