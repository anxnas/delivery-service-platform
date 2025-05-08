from django.db import models
from ..base import BaseModel


class DeliveryService(BaseModel):
    """
    Услуга доставки

    Справочник услуг, предоставляемых при доставке.
    """

    name = models.CharField(max_length=100, verbose_name="Название услуги")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Услуга доставки"
        verbose_name_plural = "Услуги доставки"
        ordering = ["name"]

    def __str__(self):
        return self.name
