# Backend службы доставки

Серверная часть платформы службы доставки, реализованная на Django и Django REST Framework.

## Содержание

- [Технологический стек](#технологический-стек)
- [Архитектура](#архитектура)
- [Требования](#требования)
- [Установка и настройка](#установка-и-настройка)
- [Документация API](#документация-api)

## Технологический стек

Backend службы доставки использует следующие технологии:

- **Python**: 3.8+
- **Django**: 5.0.4
- **Django REST Framework**: 3.15.1
- **PostgreSQL**: 14+
- **JWT-аутентификация**: djangorestframework-simplejwt 5.5.0
- **Документация API**: drf-spectacular 0.27.2
- **Логирование**: loguru 0.7.3

## Архитектура

Backend реализован по принципу RESTful API с четким разделением ответственности:

- **API-слой**: Контроллеры и сериализаторы Django REST Framework
- **Сервисный слой**: Бизнес-логика, не зависящая от представления
- **Модели данных**: ORM Django для работы с базой данных



## Требования

Для запуска и разработки бэкенда необходимы следующие компоненты:

- Python 3.8+
- PostgreSQL 14+
- pip (для установки зависимостей)
- Опционально: Docker и Docker Compose

## Установка и настройка

### Локальная установка

1. Создайте виртуальное окружение и активируйте его:

```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

2. Установите зависимости:

```bash
pip install -r requirements/base.txt  # Для продакшана: requirements/prod.txt
```

3. Настройте переменные окружения:

Создайте файл `.env` в корне проекта и настройте следующие переменные (база для разработки):

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DEBUG=True
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1
```

4. Выполните миграции базы данных:

```bash
python manage.py migrate
```

5. Создайте суперпользователя:

```bash
python manage.py createsuperuser
```

6. Запустите сервер разработки:

```bash
python manage.py runserver
```

### Установка с использованием Docker

```bash
# Сборка образа с тегом
docker build -t backend .

# Базовый запуск (порт 8000)
docker run -d -p 8000:8000 --name backend backend

# С пробросом .env файла
docker run -d -p 8000:8000 --env-file .env --name backend backend
```


## Документация API

Документация API генерируется автоматически с помощью drf-spectacular.

- Swagger UI: http://localhost:8000/api/docs/
- Скачать OpenAPI Schema: http://localhost:8000/api/schema/