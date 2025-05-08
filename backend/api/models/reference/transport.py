from django.db import models
from ..base import BaseModel


class TransportModel(BaseModel):
    """
    Модель транспорта для доставки

    Справочник моделей транспортных средств, используемых для доставки.
    """

    name = models.CharField(max_length=100, verbose_name="Название модели")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Модель транспорта"
        verbose_name_plural = "Модели транспорта"
        ordering = ["name"]

    def __str__(self):
        return self.name
