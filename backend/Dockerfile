FROM python:3.10-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY requirements/base.txt requirements/base.txt

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements/base.txt

# Копируем весь проект
COPY . .

# Создаем директории для статических и медиа файлов
RUN mkdir -p /app/static /app/media /app/logs

# Запускаем команду для сбора статических файлов
RUN python manage.py collectstatic --noinput

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Открываем порт 8000
EXPOSE 8000

# Запускаем gunicorn для обработки запросов
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "config.wsgi:application"] 