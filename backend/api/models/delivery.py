from django.db import models
from django.core.validators import MinValueValidator
from .base import BaseModel
from .reference import TransportModel, PackageType, DeliveryService, DeliveryStatus


class Delivery(BaseModel):
    """
    Модель доставки

    Основная модель доставки, содержащая всю информацию о доставке.
    """

    class TechnicalCondition(models.TextChoices):
        GOOD = "good", "Исправно"
        BAD = "bad", "Неисправно"

    # Транспорт
    transport_model = models.ForeignKey(
        TransportModel,
        on_delete=models.PROTECT,
        related_name="deliveries",
        verbose_name="Модель транспорта"
    )
    transport_number = models.CharField(max_length=50, verbose_name="Номер транспорта")

    # Время
    departure_datetime = models.DateTimeField(verbose_name="Время отправки")
    arrival_datetime = models.DateTimeField(verbose_name="Время доставки")

    # Дистанция и адреса
    distance = models.FloatField(
        validators=[MinValueValidator(0.0)],
        verbose_name="Дистанция (км)"
    )
    departure_address = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Адрес отправки"
    )
    arrival_address = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Адрес доставки"
    )

    # Медиафайл
    media_file = models.FileField(
        upload_to="delivery_files/%Y/%m/%d/",
        blank=True,
        null=True,
        verbose_name="Медиафайл"
    )

    # Связи с справочниками
    services = models.ManyToManyField(
        DeliveryService,
        related_name="deliveries",
        verbose_name="Услуги"
    )
    package_type = models.ForeignKey(
        PackageType,
        on_delete=models.PROTECT,
        related_name="deliveries",
        verbose_name="Тип упаковки"
    )
    status = models.ForeignKey(
        DeliveryStatus,
        on_delete=models.PROTECT,
        related_name="deliveries",
        verbose_name="Статус доставки"
    )
    technical_condition = models.CharField(
        max_length=10,
        choices=TechnicalCondition.choices,
        default=TechnicalCondition.GOOD,
        verbose_name="Техническое состояние"
    )

    class Meta:
        verbose_name = "Доставка"
        verbose_name_plural = "Доставки"
        ordering = ["-departure_datetime"]

    def __str__(self):
        return f"Доставка #{self.id} ({self.transport_model} {self.transport_number})"

    @property
    def duration(self):
        """Рассчитывает длительность доставки в часах"""
        if self.departure_datetime and self.arrival_datetime:
            duration = self.arrival_datetime - self.departure_datetime
            return duration.total_seconds() / 3600
        return None