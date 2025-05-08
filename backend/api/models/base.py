import uuid
from django.db import models


class BaseModel(models.Model):
    """
    Базовая модель для всех моделей проекта

    Содержит общие поля, которые используются во всех моделях:
    - id: UUID-идентификатор
    - created_at: Дата и время создания записи
    - updated_at: Дата и время последнего обновления записи
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        abstract = True
