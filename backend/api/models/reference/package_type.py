from django.db import models
from ..base import BaseModel


class PackageType(BaseModel):
    """
    Тип упаковки

    Справочник типов упаковки, используемых для доставки грузов.
    """

    name = models.CharField(max_length=100, verbose_name="Название типа упаковки")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Тип упаковки"
        verbose_name_plural = "Типы упаковки"
        ordering = ["name"]

    def __str__(self):
        return self.name
