from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from django.utils.timezone import now
from datetime import timedelta
import uuid
from rest_framework import status
from rest_framework.decorators import action

# Импорт всех представлений, которые мы будем описывать
from api.views.user import CustomTokenObtainPairView, CustomTokenRefreshView, UserProfileView
from api.views.delivery import DeliveryViewSet
from api.views.reference.transport import TransportModelViewSet
from api.views.reference.package_type import PackageTypeViewSet
from api.views.reference.devilery_service import DeliveryServiceViewSet
from api.views.reference.devilery_status import DeliveryStatusViewSet
from api.views.reference.cargo import CargoTypeViewSet
from api.views.analytics import DeliveryAnalyticsViewSet

# Примеры UUID для использования в примерах
EXAMPLE_UUID = "550e8400-e29b-41d4-a716-446655440000"
EXAMPLE_USER_ID = 1
CURRENT_DATE = now().strftime("%Y-%m-%d")
FUTURE_DATE = (now() + timedelta(days=7)).strftime("%Y-%m-%d")

ITERNAL_SERVER_ERROR_EXAMPLE = OpenApiExample(
    'Ошибка сервера',
    value="Iternal Server Error",
    response_only=True,
    status_codes=['500'],
    summary='Внутренняя ошибка сервера'
)

JSON_ERROR_EXAMPLE = OpenApiExample(
    'Ошибка парсинга JSON',
    value={"detail": "JSON parse error - Expecting property name enclosed in double quotes: line 4 column 1 (char 51)"},
    response_only=True,
    status_codes=['400'],
    summary='Ошибка парсинга JSON'
)

VALIDATION_ERROR_EXAMPLES = [
    OpenApiExample(
        'Ошибка валидации полей',
        value={
            "transport_model": ["Обязательное поле."],
        },
        response_only=True,
        status_codes=['400'],
        summary='Некорректные данные'
    ),
    OpenApiExample(
        'Ошибка формата данных',
        value={
            "departure_datetime": ["Неправильный формат datetime. Используйте один из этих форматов:  YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."]
        },
        response_only=True,
        status_codes=['400'],
        summary='Неверный формат'
    ),
    OpenApiExample(
        'Недопустимое значение',
        value={
            "technical_condition": ["Выберите корректный вариант. bade нет среди допустимых значений."]
        },
        response_only=True,
        status_codes=['400'],
        summary='Недопустимое значение'
    ),
]

# Примеры данных для моделей справочников
REFERENCE_EXAMPLE = {
    "id": EXAMPLE_UUID,
    "name": "Название",
    "description": "Подробное описание"
}

# Примеры для авторизации
AUTH_TOKEN_REQUEST_EXAMPLE = {
    "username": "admin",
    "password": "admin123"
}

AUTH_TOKEN_RESPONSE_EXAMPLE = {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3BrIjoxLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiY29sZCI6IjEyMzQ1IiwianRpIjoiZTY4OTU5ODI5ZDVjNGUzZDg4MjBmZDJiYTEzZDM3YTgiLCJleHAiOjE2MzQ2NjQ5MTIsImlhdCI6MTYzNDY2MTMxMn0.WvQ7Aj5gL0xQQ7MIGbV0bUXR0gJzaS-9uprnK8pGF9M",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3BrIjoxLCJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImNvbGQiOiIxMjM0NSIsImp0aSI6IjA4N2E0YjhiZDYwYTRkMjQ5ODU2ZjE3ZGE4OWI0YzAzIiwiZXhwIjoxNjM1MjY2MTEyLCJpYXQiOjE2MzQ2NjEzMTJ9.VOlzTkNzLQnxHEVv2NHT5dxJi38gIxU-2AFG0h2h7Eo"
}

AUTH_REFRESH_REQUEST_EXAMPLE = {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3BrIjoxLCJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImNvbGQiOiIxMjM0NSIsImp0aSI6IjA4N2E0YjhiZDYwYTRkMjQ5ODU2ZjE3ZGE4OWI0YzAzIiwiZXhwIjoxNjM1MjY2MTEyLCJpYXQiOjE2MzQ2NjEzMTJ9.VOlzTkNzLQnxHEVv2NHT5dxJi38gIxU-2AFG0h2h7Eo"
}

AUTH_REFRESH_RESPONSE_EXAMPLE = {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3BrIjoxLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiY29sZCI6IjEyMzQ1IiwianRpIjoiZTY4OTU5ODI5ZDVjNGUzZDg4MjBmZDJiYTEzZDM3YTgiLCJleHAiOjE2MzQ2NjQ5MTIsImlhdCI6MTYzNDY2MTMxMn0.WvQ7Aj5gL0xQQ7MIGbV0bUXR0gJzaS-9uprnK8pGF9M"
}

AUTH_ERROR_EXAMPLES = [
    OpenApiExample(
        'Отсутствует токен',
        value={
            'detail': 'Учетные данные не были предоставлены.'
        },
        response_only=True,
        status_codes=['401'],
        summary='Отсутствует токен'
    ),
    OpenApiExample(
        'Недействительный токен',
        value={
              "detail": "Данный токен недействителен для любого типа токена",
              "code": "token_not_valid",
              "messages": [
                {
                  "token_class": "AccessToken",
                  "token_type": "access",
                  "message": "Token is invalid"
                }
              ]
        },
        response_only=True,
        status_codes=['401'],
        summary='Недействительный токен'
    ),
]

USER_PROFILE_RESPONSE_EXAMPLE = {
    "id": EXAMPLE_USER_ID,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_staff": True,
    "date_joined": "2023-01-15T12:00:00Z"
}

# Примеры данных для доставок
DELIVERY_LIST_RESPONSE_EXAMPLE = {
    "count": 10,
    "next": "http://example.com/api/deliveries/?page=2",
    "previous": None,
    "results": [
        {
            "id": EXAMPLE_UUID,
            "transport_model_name": "Газель",
            "transport_number": "А123ВС777",
            "departure_datetime": "2023-10-01T10:00:00Z",
            "arrival_datetime": "2023-10-01T14:00:00Z",
            "distance": 120.5,
            "package_type_name": "Коробка",
            "status_name": "Проведено",
            "status_color": "#00FF00",
            "technical_condition": "good",
            "duration": 4.0,
            "services": ["Экспресс-доставка", "Страховка"],
            "created_at": "2023-09-30T12:00:00Z"
        }
    ]
}

DELIVERY_DETAIL_RESPONSE_EXAMPLE = {
    "id": EXAMPLE_UUID,
    "transport_model": "550e8400-e29b-41d4-a716-446655440001",
    "transport_number": "А123ВС777",
    "departure_datetime": "2023-10-01T10:00:00Z",
    "arrival_datetime": "2023-10-01T14:00:00Z",
    "distance": 120.5,
    "departure_address": "Москва, ул. Пушкина, д. 10",
    "arrival_address": "Санкт-Петербург, ул. Лермонтова, д. 15",
    "media_file": "http://example.com/media/delivery_files/2023/10/01/document.pdf",
    "package_type": "550e8400-e29b-41d4-a716-446655440002",
    "status": "550e8400-e29b-41d4-a716-446655440003",
    "technical_condition": "good",
    "services": [
        "550e8400-e29b-41d4-a716-446655440004",
        "550e8400-e29b-41d4-a716-446655440005"
    ],
    "duration": 4.0,
    "created_at": "2023-09-30T12:00:00Z",
    "updated_at": "2023-10-01T15:00:00Z"
}

DELIVERY_CREATE_REQUEST_EXAMPLE = {
    "transport_model": "550e8400-e29b-41d4-a716-446655440001",
    "transport_number": "А123ВС777",
    "departure_datetime": "2023-10-01T10:00:00Z",
    "arrival_datetime": "2023-10-01T14:00:00Z",
    "distance": 120.5,
    "departure_address": "Москва, ул. Пушкина, д. 10",
    "arrival_address": "Санкт-Петербург, ул. Лермонтова, д. 15",
    "package_type": "550e8400-e29b-41d4-a716-446655440002",
    "status": "550e8400-e29b-41d4-a716-446655440003",
    "technical_condition": "good",
    "services": [
        "550e8400-e29b-41d4-a716-446655440004",
        "550e8400-e29b-41d4-a716-446655440005"
    ]
}

# Примеры для аналитики
ANALYTICS_RESPONSE_EXAMPLE = {
    "daily_stats": [
        {
            "date": "2023-10-01",
            "count": 5,
            "total_distance": 550.75,
            "avg_distance": 110.15
        },
        {
            "date": "2023-10-02",
            "count": 7,
            "total_distance": 780.3,
            "avg_distance": 111.47
        }
    ],
    "status_stats": [
        {
            "status__name": "Проведено",
            "status__color": "#00FF00",
            "count": 8
        },
        {
            "status__name": "В ожидании",
            "status__color": "#FFFF00",
            "count": 4
        }
    ],
    "transport_stats": [
        {
            "transport_model__name": "Газель",
            "count": 7
        },
        {
            "transport_model__name": "Камаз",
            "count": 5
        }
    ],
    "service_stats": [
        {
            "services__name": "Экспресс-доставка",
            "count": 6
        },
        {
            "services__name": "Страховка",
            "count": 9
        }
    ],
    "total_deliveries": 12,
    "total_distance": 1331.05
}

# Параметры фильтрации для доставок
DELIVERY_FILTER_PARAMETERS = [
    OpenApiParameter(
        name='status',
        description='Фильтрация по UUID статуса доставки. Пример: 550e8400-e29b-41d4-a716-446655440003',
        required=False,
        type=OpenApiTypes.UUID
    ),
    OpenApiParameter(
        name='transport_model',
        description='Фильтрация по UUID модели транспорта. Пример: 550e8400-e29b-41d4-a716-446655440001',
        required=False,
        type=OpenApiTypes.UUID
    ),
    OpenApiParameter(
        name='package_type',
        description='Фильтрация по UUID типу упаковки. Пример: 550e8400-e29b-41d4-a716-446655440002',
        required=False,
        type=OpenApiTypes.UUID
    ),
    OpenApiParameter(
        name='technical_condition',
        description='Фильтрация по техническому состоянию (good - Исправно, bad - Неисправно). Пример: good',
        required=False,
        type=OpenApiTypes.STR,
        enum=['good', 'bad']
    ),
    OpenApiParameter(
        name='min_duration',
        description='Фильтрация по минимальной продолжительности доставки в часах. Пример: 2.5',
        required=False,
        type=OpenApiTypes.FLOAT
    ),
    OpenApiParameter(
        name='max_duration',
        description='Фильтрация по максимальной продолжительности доставки в часах. Пример: 5.0',
        required=False,
        type=OpenApiTypes.FLOAT
    ),
    OpenApiParameter(
        name='start_date',
        description=f'Фильтрация по начальной дате доставки (формат YYYY-MM-DD). Пример: {CURRENT_DATE}',
        required=False,
        type=OpenApiTypes.DATE
    ),
    OpenApiParameter(
        name='end_date',
        description=f'Фильтрация по конечной дате доставки (формат YYYY-MM-DD). Пример: {FUTURE_DATE}',
        required=False,
        type=OpenApiTypes.DATE
    ),
    OpenApiParameter(
        name='services',
        description='Фильтрация по UUID услуг, через запятую. Пример: 550e8400-e29b-41d4-a716-446655440004,550e8400-e29b-41d4-a716-446655440005',
        required=False,
        type=OpenApiTypes.STR
    ),
    OpenApiParameter(
        name='search',
        description='Поиск по номеру транспорта, адресу отправки, адресу доставки. Пример: Москва',
        required=False,
        type=OpenApiTypes.STR
    ),
    OpenApiParameter(
        name='ordering',
        description='Сортировка по полям (со знаком минус для обратной сортировки). Пример: -departure_datetime',
        required=False,
        type=OpenApiTypes.STR
    ),
]

# Параметры фильтрации для аналитики
ANALYTICS_FILTER_PARAMETERS = [
    OpenApiParameter(
        name='start_date',
        description=f'Фильтрация по начальной дате доставки (формат YYYY-MM-DD). Пример: {CURRENT_DATE}',
        required=False,
        type=OpenApiTypes.DATE
    ),
    OpenApiParameter(
        name='end_date',
        description=f'Фильтрация по конечной дате доставки (формат YYYY-MM-DD). Пример: {FUTURE_DATE}',
        required=False,
        type=OpenApiTypes.DATE
    ),
    OpenApiParameter(
        name='services',
        description='Фильтрация по UUID услуг, через запятую. Пример: 550e8400-e29b-41d4-a716-446655440004,550e8400-e29b-41d4-a716-446655440005',
        required=False,
        type=OpenApiTypes.STR
    ),
    OpenApiParameter(
        name='cargo_types',
        description='Фильтрация по UUID типов груза, через запятую. Пример: 550e8400-e29b-41d4-a716-446655440006,550e8400-e29b-41d4-a716-446655440007',
        required=False,
        type=OpenApiTypes.STR
    ),
]

# Параметры пагинации
PAGINATION_PARAMETERS = [
    OpenApiParameter(
        name='page',
        description='Номер страницы для пагинации результатов. Пример: 1',
        required=False,
        type=OpenApiTypes.INT
    ),
    OpenApiParameter(
        name='page_size',
        description='Количество элементов на странице (от 1 до 100). По умолчанию: 20. Пример: 10',
        required=False,
        type=OpenApiTypes.INT
    ),
]

# Расширение схемы для авторизации
extend_schema_view_auth = extend_schema_view(
    post=extend_schema(
        tags=['Авторизация'],
        operation_id='auth_token',
        summary='Получение JWT токенов',
        description="""
        Аутентификация пользователя и получение пары JWT токенов (access и refresh).

        Access токен имеет срок действия 1 час и используется для доступа к API.
        Refresh токен имеет срок действия 7 дней и используется для получения нового access токена без повторного ввода учетных данных.

        Необходимо передавать access токен в заголовке Authorization в формате: Bearer <токен>
        """,
        request={
            'application/json': {
                'type': 'object',
                'required': ['username', 'password'],
                'properties': {
                    'username': {
                        'type': 'string',
                        'description': 'Имя пользователя'
                    },
                    'password': {
                        'type': 'string',
                        'format': 'password',
                        'description': 'Пароль пользователя'
                    }
                }
            }
        },
        responses={
            status.HTTP_200_OK: {
                'type': 'object',
                'properties': {
                    'access': {
                        'type': 'string',
                        'description': 'JWT токен доступа, действует 1 час',
                    },
                    'refresh': {
                        'type': 'string',
                        'description': 'JWT токен обновления, действует 7 дней',
                    }
                }
            },
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Запрос',
                value=AUTH_TOKEN_REQUEST_EXAMPLE,
                request_only=True,
                summary='Пример запроса для получения токенов'
            ),
            OpenApiExample(
                'Успешный ответ',
                value=AUTH_TOKEN_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Успешная аутентификация'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка аутентификации',
                value={'detail': 'Не найдено активной учетной записи с указанными данными'},
                response_only=True,
                status_codes=['401'],
                summary='Неверные учетные данные'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для CustomTokenObtainPairView
CustomTokenObtainPairView = extend_schema_view_auth(CustomTokenObtainPairView)

# Расширение схемы для обновления токенов
extend_schema_view_refresh = extend_schema_view(
    post=extend_schema(
        tags=['Авторизация'],
        operation_id='auth_token_refresh',
        summary='Обновление JWT токена',
        description="""
        Обновление access токена с использованием refresh токена.

        Этот эндпоинт позволяет получить новый access токен без повторного ввода учетных данных,
        используя действующий refresh токен.
        """,
        request={
            'application/json': {
                'type': 'object',
                'required': ['refresh'],
                'properties': {
                    'refresh': {
                        'type': 'string',
                        'description': 'JWT токен обновления'
                    }
                }
            }
        },
        responses={
            status.HTTP_200_OK: {
                'type': 'object',
                'properties': {
                    'access': {
                        'type': 'string',
                        'description': 'Новый JWT токен доступа, действует 1 час',
                    }
                }
            },
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Запрос',
                value=AUTH_REFRESH_REQUEST_EXAMPLE,
                request_only=True,
                summary='Пример запроса для обновления токена'
            ),
            OpenApiExample(
                'Успешный ответ',
                value=AUTH_REFRESH_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Успешное обновление'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка обновления',
                value={'detail': 'Токен недействителен или просрочен'},
                response_only=True,
                status_codes=['401'],
                summary='Недействительный refresh токен'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для CustomTokenRefreshView
CustomTokenRefreshView = extend_schema_view_refresh(CustomTokenRefreshView)

# Расширение схемы для профиля пользователя
extend_schema_view_profile = extend_schema_view(
    get=extend_schema(
        tags=['Авторизация'],
        operation_id='user_profile',
        summary='Получение информации о текущем пользователе',
        description="""
        Возвращает информацию о текущем авторизованном пользователе.

        Требуется валидный JWT токен в заголовке Authorization.
        """,
        responses={
            status.HTTP_200_OK: {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer', 'description': 'ID пользователя'},
                    'username': {'type': 'string', 'description': 'Имя пользователя'},
                    'email': {'type': 'string', 'format': 'email', 'description': 'Email пользователя'},
                    'first_name': {'type': 'string', 'description': 'Имя'},
                    'last_name': {'type': 'string', 'description': 'Фамилия'},
                    'is_staff': {'type': 'boolean', 'description': 'Признак администратора'},
                    'date_joined': {'type': 'string', 'format': 'date-time', 'description': 'Дата регистрации'}
                }
            },
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value=USER_PROFILE_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Профиль пользователя'
            ),
            *AUTH_ERROR_EXAMPLES,
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для UserProfileView
UserProfileView = extend_schema_view_profile(UserProfileView)

# Расширение схемы для транспортных моделей
extend_schema_view_transport = extend_schema_view(
    list=extend_schema(
        tags=['Справочники'],
        operation_id='transport_models_list',
        summary='Получение списка моделей транспорта',
        description="""
        Возвращает список всех доступных моделей транспорта.

        Используется для получения справочных данных по транспортным средствам, которые могут быть использованы для доставки.
        """,
        parameters=PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={
                    "count": 3,
                    "next": None,
                    "previous": None,
                    "results": [
                        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Газель",
                         "description": "Грузовой автомобиль малой грузоподъёмности"},
                        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Камаз",
                         "description": "Грузовой автомобиль средней грузоподъёмности"},
                        {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "МАЗ",
                         "description": "Грузовой автомобиль большой грузоподъёмности"}
                    ]
                },
                response_only=True,
                summary='Список моделей транспорта'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Справочники'],
        operation_id='transport_models_read',
        summary='Получение информации о модели транспорта',
        description="""
        Возвращает детальную информацию о конкретной модели транспорта по её идентификатору.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Газель",
                       "description": "Грузовой автомобиль малой грузоподъёмности"},
                response_only=True,
                summary='Модель транспорта'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Справочник не найден'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для TransportModelViewSet
TransportModelViewSet = extend_schema_view_transport(TransportModelViewSet)

# Расширение схемы для типов упаковки
extend_schema_view_package_type = extend_schema_view(
    list=extend_schema(
        tags=['Справочники'],
        operation_id='package_types_list',
        summary='Получение списка типов упаковки',
        description="""
        Возвращает список всех доступных типов упаковки.

        Используется для получения справочных данных по типам упаковки, которые могут быть использованы для доставки.
        """,
        parameters=PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={
                    "count": 3,
                    "next": None,
                    "previous": None,
                    "results": [
                        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Коробка",
                         "description": "Картонная коробка стандартного размера"},
                        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Паллета",
                         "description": "Поддон для групповой упаковки грузов"},
                        {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "Контейнер",
                         "description": "Большой металлический контейнер для транспортировки"}
                    ]
                },
                response_only=True,
                summary='Список типов упаковки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Справочники'],
        operation_id='package_types_read',
        summary='Получение информации о типе упаковки',
        description="""
        Возвращает детальную информацию о конкретном типе упаковки по его идентификатору.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Коробка",
                       "description": "Картонная коробка стандартного размера"},
                response_only=True,
                summary='Тип упаковки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Справочник не найден'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для PackageTypeViewSet
PackageTypeViewSet = extend_schema_view_package_type(PackageTypeViewSet)

# Расширение схемы для услуг доставки
extend_schema_view_delivery_service = extend_schema_view(
    list=extend_schema(
        tags=['Справочники'],
        operation_id='delivery_services_list',
        summary='Получение списка услуг доставки',
        description="""
        Возвращает список всех доступных услуг доставки.

        Используется для получения справочных данных по услугам, которые могут быть предоставлены при доставке.
        """,
        parameters=PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={
                    "count": 3,
                    "next": None,
                    "previous": None,
                    "results": [
                        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Экспресс-доставка",
                         "description": "Доставка в течение 24 часов"},
                        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Страховка",
                         "description": "Страхование груза на время перевозки"},
                        {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "СМС-уведомление",
                         "description": "Отправка СМС о статусе доставки"}
                    ]
                },
                response_only=True,
                summary='Список услуг доставки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Справочники'],
        operation_id='delivery_services_read',
        summary='Получение информации об услуге доставки',
        description="""
        Возвращает детальную информацию о конкретной услуге доставки по её идентификатору.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Экспресс-доставка",
                       "description": "Доставка в течение 24 часов"},
                response_only=True,
                summary='Услуга доставки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Справочник не найден'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для DeliveryServiceViewSet
DeliveryServiceViewSet = extend_schema_view_delivery_service(DeliveryServiceViewSet)

# Расширение схемы для статусов доставки
extend_schema_view_delivery_status = extend_schema_view(
    list=extend_schema(
        tags=['Справочники'],
        operation_id='delivery_statuses_list',
        summary='Получение списка статусов доставки',
        description="""
        Возвращает список всех доступных статусов доставки.

        Используется для получения справочных данных по статусам, в которых может находиться доставка.
        """,
        parameters=PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={
                    "count": 2,
                    "next": None,
                    "previous": None,
                    "results": [
                        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "В ожидании",
                         "color": "#FFFF00", "description": "Доставка ожидает отправки"},
                        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Проведено",
                         "color": "#00FF00", "description": "Доставка успешно завершена"}
                    ]
                },
                response_only=True,
                summary='Список статусов доставки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Справочники'],
        operation_id='delivery_statuses_read',
        summary='Получение информации о статусе доставки',
        description="""
        Возвращает детальную информацию о конкретном статусе доставки по его идентификатору.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={"id": "550e8400-e29b-41d4-a716-446655440001", "name": "В ожидании",
                       "color": "#FFFF00", "description": "Доставка ожидает отправки"},
                response_only=True,
                summary='Статус доставки'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Справочник не найден'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для DeliveryStatusViewSet
DeliveryStatusViewSet = extend_schema_view_delivery_status(DeliveryStatusViewSet)

# Расширение схемы для типов груза
extend_schema_view_cargo_type = extend_schema_view(
    list=extend_schema(
        tags=['Справочники'],
        operation_id='cargo_types_list',
        summary='Получение списка типов груза',
        description="""
        Возвращает список всех доступных типов груза.

        Используется для получения справочных данных по типам грузов, которые могут быть перевезены.
        """,
        parameters=PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={
                    "count": 3,
                    "next": None,
                    "previous": None,
                    "results": [
                        {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Продукты",
                         "description": "Продукты питания, требующие особых условий хранения"},
                        {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "Электроника",
                         "description": "Электронные устройства и комплектующие"},
                        {"id": "550e8400-e29b-41d4-a716-446655440003", "name": "Мебель",
                         "description": "Предметы интерьера и мебель"}
                    ]
                },
                response_only=True,
                summary='Список типов груза'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Справочники'],
        operation_id='cargo_types_read',
        summary='Получение информации о типе груза',
        description="""
        Возвращает детальную информацию о конкретном типе груза по его идентификатору.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value={"id": "550e8400-e29b-41d4-a716-446655440001", "name": "Продукты",
                       "description": "Продукты питания, требующие особых условий хранения"},
                response_only=True,
                summary='Тип груза'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Справочник не найден'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Применяем схему для CargoTypeViewSet
CargoTypeViewSet = extend_schema_view_cargo_type(CargoTypeViewSet)

# Расширение схемы для доставок
extend_schema_view_delivery = extend_schema_view(
    list=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_list',
        summary='Получение списка доставок',
        description="""
        Возвращает список всех доставок с возможностью фильтрации и пагинации.

        Для списка доставок используется упрощенный сериализатор, содержащий только основные данные.
        Для получения полной информации о доставке используйте эндпоинт получения конкретной доставки.
        """,
        parameters=DELIVERY_FILTER_PARAMETERS + PAGINATION_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value=DELIVERY_LIST_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Список доставок'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Неправильная страница'},
                response_only=True,
                status_codes=['404'],
                summary='Неправильная страница'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    retrieve=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_read',
        summary='Получение информации о доставке',
        description="""
        Возвращает детальную информацию о конкретной доставке по её идентификатору.

        Включает все поля доставки, включая время, адреса, информацию о транспорте,
        статус, услуги и другие параметры.
        """,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value=DELIVERY_DETAIL_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Детальная информация о доставке'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Доставка не найдена'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    create=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_create',
        summary='Создание новой доставки',
        description="""
        Создает новую доставку с указанными параметрами.

        Обязательные поля: transport_model, transport_number, departure_datetime, 
        arrival_datetime, distance, package_type, status.

        Опциональные поля: departure_address, arrival_address, media_file, 
        technical_condition, services.
        """,
        request=OpenApiTypes.OBJECT,
        responses={
            status.HTTP_201_CREATED: OpenApiTypes.OBJECT,
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Запрос',
                value=DELIVERY_CREATE_REQUEST_EXAMPLE,
                request_only=True,
                summary='Данные для создания доставки'
            ),
            OpenApiExample(
                'Успешный ответ',
                value=DELIVERY_DETAIL_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Созданная доставка'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Доставка не найдена'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    update=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_update',
        summary='Полное обновление информации о доставке',
        description="""
        Полностью обновляет информацию о доставке с указанными параметрами.

        Требуется передать все поля доставки, включая те, которые не изменяются.
        Для частичного обновления используйте PATCH запрос.
        """,
        request=OpenApiTypes.OBJECT,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Запрос',
                value=DELIVERY_CREATE_REQUEST_EXAMPLE,
                request_only=True,
                summary='Данные для обновления доставки'
            ),
            OpenApiExample(
                'Успешный ответ',
                value=DELIVERY_DETAIL_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Обновленная доставка'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Доставка не найдена'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    partial_update=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_partial_update',
        summary='Частичное обновление информации о доставке',
        description="""
        Частично обновляет информацию о доставке.

        Позволяет обновить только указанные поля, оставляя остальные без изменений.
        """,
        request=OpenApiTypes.OBJECT,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Запрос',
                value={
                    "status": "550e8400-e29b-41d4-a716-446655440002",
                    "technical_condition": "bad"
                },
                request_only=True,
                summary='Данные для частичного обновления'
            ),
            OpenApiExample(
                'Успешный ответ',
                value=DELIVERY_DETAIL_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Обновленная доставка'
            ),
            JSON_ERROR_EXAMPLE,
            *VALIDATION_ERROR_EXAMPLES,
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Доставка не найдена'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    ),
    destroy=extend_schema(
        tags=['Доставки'],
        operation_id='deliveries_delete',
        summary='Удаление доставки',
        description="""
        Удаляет доставку по её идентификатору.

        Эта операция необратима. После удаления доставки её невозможно восстановить.
        """,
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiTypes.NONE,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка 404',
                value={'detail': 'Страница не найдена.'},
                response_only=True,
                status_codes=['404'],
                summary='Доставка не найдена'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE
        ]
    )
)

# Добавляем расширения для дополнительных методов в DeliveryViewSet
extend_schema_complete = extend_schema(
    tags=['Доставки'],
    operation_id='deliveries_complete',
    summary='Завершение доставки',
    description="""
    Изменяет статус доставки на "Проведено".

    Это действие используется для быстрого завершения доставки без необходимости 
    выполнять полное обновление через PUT или PATCH запросы.

    Требуется передать идентификатор доставки в виде строки. Не требуется тело запроса.
    """,
    request=None,
    responses={
        status.HTTP_200_OK: OpenApiTypes.OBJECT,
        status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
        status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
        status.HTTP_404_NOT_FOUND: OpenApiTypes.OBJECT,
        status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
    },
    examples=[
        OpenApiExample(
            'Успешный ответ',
            value=DELIVERY_DETAIL_RESPONSE_EXAMPLE,
            response_only=True,
            summary='Завершенная доставка'
        ),
        OpenApiExample(
            'Ошибка',
            value={"error": "Статус 'Проведено' не найден в базе данных"},
            response_only=True,
            status_codes=['400'],
            summary='Ошибка при завершении'
        ),
        *AUTH_ERROR_EXAMPLES,
        OpenApiExample(
            'Ошибка 404',
            value={'detail': 'Страница не найдена.'},
            response_only=True,
            status_codes=['404'],
            summary='Доставка не найдена'
        ),
        ITERNAL_SERVER_ERROR_EXAMPLE
    ]
)

# Добавляем схему для дополнительного метода complete
original_complete = DeliveryViewSet.complete
DeliveryViewSet.complete = extend_schema_complete(original_complete)

# Применяем основную схему для DeliveryViewSet
DeliveryViewSet = extend_schema_view_delivery(DeliveryViewSet)

# Расширение схемы для аналитики доставок
extend_schema_view_analytics = extend_schema_view(
    list=extend_schema(
        tags=['Аналитика'],
        operation_id='delivery_analytics',
        summary='Получение аналитики по доставкам',
        description="""
        Возвращает статистические данные по доставкам для построения отчетов и графиков.

        Аналитика включает:
        - Статистику по дням (количество доставок, общее и среднее расстояние)
        - Статистику по статусам (количество доставок в каждом статусе)
        - Статистику по моделям транспорта
        - Статистику по услугам
        - Общую статистику (общее количество доставок и общее расстояние)

        Можно фильтровать по дате, услугам и типам груза.
        """,
        parameters=ANALYTICS_FILTER_PARAMETERS,
        responses={
            status.HTTP_200_OK: OpenApiTypes.OBJECT,
            status.HTTP_401_UNAUTHORIZED: OpenApiTypes.OBJECT,
            status.HTTP_405_METHOD_NOT_ALLOWED: OpenApiTypes.OBJECT,
            status.HTTP_500_INTERNAL_SERVER_ERROR: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'Успешный ответ',
                value=ANALYTICS_RESPONSE_EXAMPLE,
                response_only=True,
                summary='Аналитика по доставкам'
            ),
            *AUTH_ERROR_EXAMPLES,
            OpenApiExample(
                'Ошибка передачи параметра',
                value={"detail": "Метод не поддерживается. Используйте GET запрос без параметров для получения аналитики."},
                response_only=True,
                status_codes=['405'],
                summary='Передача параметра'
            ),
            ITERNAL_SERVER_ERROR_EXAMPLE,
            OpenApiExample(
                'Ошибка формата данных в аналитике',
                value={"detail": "Ошибка при получении аналитики: ['Значение “2023.05.17” имеет неверный формат даты. Оно должно быть в формате YYYY-MM-DD.']"},
                response_only=True,
                status_codes=['500'],
                summary='Ошибка аналитики'
            ),
        ]
    ),
    retrieve=extend_schema(
        exclude=True,  # Это скрывает эндпоинт /{id}/ из документации
        operation_id="analytics_retrieve_hidden"
    )
)

# Применяем схему для DeliveryAnalyticsView
DeliveryAnalyticsView = extend_schema_view_analytics(DeliveryAnalyticsViewSet)