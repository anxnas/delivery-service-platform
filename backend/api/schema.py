from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.plumbing import build_parameter_type
from drf_spectacular.utils import OpenApiExample, extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import status


class JWTAuthenticationScheme(OpenApiAuthenticationExtension):
    """Расширение для документации JWT аутентификации"""
    target_class = 'rest_framework_simplejwt.authentication.JWTAuthentication'
    name = 'JWT Auth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
            'description': 'Введите JWT токен в формате: Bearer <token>'
        }


# Определения общих параметров
delivery_id_param = OpenApiParameter(
    name='id',
    type=str,
    location=OpenApiParameter.PATH,
    description='UUID доставки'
)

date_filter_params = [
    OpenApiParameter(
        name='start_date',
        type=str,
        location=OpenApiParameter.QUERY,
        description='Дата начала периода (формат YYYY-MM-DD)',
        examples=[
            OpenApiExample(
                'Пример',
                value='2023-01-01'
            )
        ]
    ),
    OpenApiParameter(
        name='end_date',
        type=str,
        location=OpenApiParameter.QUERY,
        description='Дата конца периода (формат YYYY-MM-DD)',
        examples=[
            OpenApiExample(
                'Пример',
                value='2023-12-31'
            )
        ]
    )
]

distance_filter_params = [
    OpenApiParameter(
        name='min_distance',
        type=float,
        location=OpenApiParameter.QUERY,
        description='Минимальная дистанция (км)'
    ),
    OpenApiParameter(
        name='max_distance',
        type=float,
        location=OpenApiParameter.QUERY,
        description='Максимальная дистанция (км)'
    )
]

services_filter_param = OpenApiParameter(
    name='services',
    type=str,
    location=OpenApiParameter.QUERY,
    description='Фильтр по услугам (список ID услуг через запятую)',
    examples=[
        OpenApiExample(
            'Пример',
            value='f47ac10b-58cc-4372-a567-0e02b2c3d479,7f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f3f'
        )
    ]
)

# Общие ответы
unauthorized_response = OpenApiResponse(
    description='Не авторизован',
    examples=[
        OpenApiExample(
            'Пример',
            value={
                'detail': 'Учетные данные не были предоставлены'
            }
        )
    ]
)

forbidden_response = OpenApiResponse(
    description='Доступ запрещен',
    examples=[
        OpenApiExample(
            'Пример',
            value={
                'detail': 'У вас недостаточно прав для выполнения данного действия'
            }
        )
    ]
)

not_found_response = OpenApiResponse(
    description='Объект не найден',
    examples=[
        OpenApiExample(
            'Пример',
            value={
                'detail': 'Не найдено.'
            }
        )
    ]
)

validation_error_response = OpenApiResponse(
    description='Ошибка валидации',
    examples=[
        OpenApiExample(
            'Пример',
            value={
                'field_name': [
                    'Это поле обязательно.'
                ]
            }
        )
    ]
)

# Определения схем для стандартных методов
delivery_list_schema = extend_schema(
    summary='Получение списка доставок',
    description='Возвращает список всех доставок с возможностью фильтрации и пагинации',
    parameters=date_filter_params + distance_filter_params + [services_filter_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Успешный запрос'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
    },
    tags=['Доставки']
)

delivery_retrieve_schema = extend_schema(
    summary='Получение информации о доставке',
    description='Возвращает полную информацию о конкретной доставке',
    parameters=[delivery_id_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Успешный запрос'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    },
    tags=['Доставки']
)

delivery_create_schema = extend_schema(
    summary='Создание новой доставки',
    description='Создает новую доставку с указанными параметрами',
    responses={
        status.HTTP_201_CREATED: OpenApiResponse(description='Доставка успешно создана'),
        status.HTTP_400_BAD_REQUEST: validation_error_response,
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
    },
    tags=['Доставки']
)

delivery_update_schema = extend_schema(
    summary='Полное обновление доставки',
    description='Обновляет все поля доставки',
    parameters=[delivery_id_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Доставка успешно обновлена'),
        status.HTTP_400_BAD_REQUEST: validation_error_response,
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    },
    tags=['Доставки']
)

delivery_partial_update_schema = extend_schema(
    summary='Частичное обновление доставки',
    description='Обновляет указанные поля доставки',
    parameters=[delivery_id_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Доставка успешно обновлена'),
        status.HTTP_400_BAD_REQUEST: validation_error_response,
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    },
    tags=['Доставки']
)

delivery_delete_schema = extend_schema(
    summary='Удаление доставки',
    description='Удаляет указанную доставку',
    parameters=[delivery_id_param],
    responses={
        status.HTTP_204_NO_CONTENT: OpenApiResponse(description='Доставка успешно удалена'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    },
    tags=['Доставки']
)

delivery_complete_schema = extend_schema(
    summary='Завершение доставки',
    description='Изменяет статус доставки на "Проведено"',
    parameters=[delivery_id_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Статус доставки успешно изменен'),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(description='Ошибка при изменении статуса'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    },
    tags=['Доставки']
)

# Схемы для справочников
reference_list_schema = extend_schema(
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Успешный запрос'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
    }
)

reference_retrieve_schema = extend_schema(
    responses={
        status.HTTP_200_OK: OpenApiResponse(description='Успешный запрос'),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
        status.HTTP_404_NOT_FOUND: not_found_response,
    }
)

# Схема для аналитики
analytics_schema = extend_schema(
    summary='Аналитика по доставкам',
    description='Возвращает статистические данные по доставкам с возможностью фильтрации',
    parameters=date_filter_params + [services_filter_param],
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            description='Аналитические данные',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'daily_stats': [
                            {
                                'date': '2023-01-01',
                                'count': 5,
                                'total_distance': 250.5,
                                'avg_distance': 50.1
                            }
                        ],
                        'status_stats': [
                            {
                                'status__name': 'Проведено',
                                'status__color': '#28a745',
                                'count': 15
                            }
                        ],
                        'transport_stats': [
                            {
                                'transport_model__name': 'V01',
                                'count': 10
                            }
                        ],
                        'service_stats': [
                            {
                                'services__name': 'До клиента',
                                'count': 12
                            }
                        ],
                        'total_deliveries': 25,
                        'total_distance': 1350.75
                    }
                )
            ]
        ),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
    },
    tags=['Аналитика']
)

# Схемы для аутентификации
token_obtain_schema = extend_schema(
    summary='Получение JWT токена',
    description='Аутентификация пользователя и получение Access и Refresh токенов',
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            description='Успешная аутентификация',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                    }
                )
            ]
        ),
        status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
            description='Ошибка аутентификации',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'detail': 'No active account found with the given credentials'
                    }
                )
            ]
        ),
    },
    tags=['Авторизация']
)

token_refresh_schema = extend_schema(
    summary='Обновление JWT токена',
    description='Получение нового Access токена с использованием Refresh токена',
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            description='Токен успешно обновлен',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
                    }
                )
            ]
        ),
        status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
            description='Ошибка при обновлении токена',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'detail': 'Token is invalid or expired',
                        'code': 'token_not_valid'
                    }
                )
            ]
        ),
    },
    tags=['Авторизация']
)

user_profile_schema = extend_schema(
    summary='Профиль пользователя',
    description='Получение информации о текущем пользователе',
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            description='Данные пользователя',
            examples=[
                OpenApiExample(
                    'Пример',
                    value={
                        'id': 1,
                        'username': 'admin',
                        'email': 'admin@example.com',
                        'first_name': 'Admin',
                        'last_name': 'User',
                        'is_staff': True,
                        'date_joined': '2023-01-01T00:00:00Z'
                    }
                )
            ]
        ),
        status.HTTP_401_UNAUTHORIZED: unauthorized_response,
    },
    tags=['Авторизация']
)