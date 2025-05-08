from django.db import models
from ..base import BaseModel


class CargoType(BaseModel):
    """
    Тип груза (опционально)

    Справочник типов грузов для доставки.
    """

    name = models.CharField(max_length=100, verbose_name="Название типа груза")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Тип груза"
        verbose_name_plural = "Типы груза"
        ordering = ["name"]

    def __str__(self):
        return self.name
