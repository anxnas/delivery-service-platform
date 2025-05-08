from django.db import models
from ..base import BaseModel


class DeliveryStatus(BaseModel):
    """
    Статус доставки

    Справочник возможных статусов доставки.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "В ожидании"
        COMPLETED = "completed", "Проведено"

    name = models.CharField(max_length=100, verbose_name="Название статуса")
    code = models.CharField(max_length=50, choices=Status.choices, verbose_name="Код статуса")
    color = models.CharField(max_length=7, default="#FFFF00", verbose_name="Цвет статуса")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Статус доставки"
        verbose_name_plural = "Статусы доставки"
        ordering = ["name"]

    def __str__(self):
        return self.name
