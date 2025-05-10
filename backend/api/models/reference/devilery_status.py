from django.db import models
from ..base import BaseModel


class DeliveryStatus(BaseModel):
    """
    Статус доставки

    Справочник возможных статусов доставки.
    """

    name = models.CharField(max_length=100, unique=True, verbose_name="Название статуса")
    color = models.CharField(max_length=7, default="#FFFF00", verbose_name="Цвет статуса")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Статус доставки"
        verbose_name_plural = "Статусы доставки"
        ordering = ["name"]

    def __str__(self):
        return self.name
