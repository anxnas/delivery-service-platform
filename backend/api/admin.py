from django.contrib import admin
from .models import TransportModel, PackageType, DeliveryService, DeliveryStatus, CargoType, Delivery


@admin.register(TransportModel)
class TransportModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


@admin.register(PackageType)
class PackageTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


@admin.register(DeliveryService)
class DeliveryServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


@admin.register(DeliveryStatus)
class DeliveryStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'color', 'description', 'created_at')
    search_fields = ('name', 'code', 'description')
    list_filter = ('code',)


@admin.register(CargoType)
class CargoTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


class DeliveryServicesInline(admin.TabularInline):
    model = Delivery.services.through
    extra = 1


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'transport_model',
        'transport_number',
        'departure_datetime',
        'arrival_datetime',
        'distance',
        'status',
        'technical_condition',
        'created_at'
    )
    list_filter = ('status', 'technical_condition', 'transport_model', 'package_type')
    search_fields = ('transport_number', 'departure_address', 'arrival_address')
    date_hierarchy = 'departure_datetime'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Транспорт', {
            'fields': ('transport_model', 'transport_number', 'technical_condition')
        }),
        ('Время и маршрут', {
            'fields': ('departure_datetime', 'arrival_datetime', 'distance', 'departure_address', 'arrival_address')
        }),
        ('Детали доставки', {
            'fields': ('package_type', 'status', 'media_file')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [DeliveryServicesInline]
    exclude = ('services',)