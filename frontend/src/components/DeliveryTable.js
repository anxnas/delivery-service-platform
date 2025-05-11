import React, { useEffect } from 'react';
import {
  DataGrid,
  gridClasses,
  useGridApiRef,
} from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Box, Chip } from '@mui/material';

const DeliveryTable = ({ 
  deliveries = [], 
  totalCount = 0, 
  page = 0, 
  pageSize = 10, 
  onPageChange, 
  onPageSizeChange 
}) => {
  // Логирование получаемых данных для отладки
  useEffect(() => {
    if (deliveries.length > 0) {
      console.log('Данные доставок:', deliveries[0]);
      console.log('Проверка полей для отладки:');
      console.log('departure_datetime:', deliveries[0].departure_datetime);
      console.log('arrival_datetime:', deliveries[0].arrival_datetime);
      console.log('distance:', deliveries[0].distance);
      console.log('duration:', deliveries[0].duration);
    }
  }, [deliveries]);

  // Определение колонок таблицы
  const columns = [
    { 
      field: 'transport_model_name', 
      headerName: 'Модель транспорта', 
      flex: 1,
      minWidth: 150,
    },
    { 
      field: 'transport_number', 
      headerName: 'Номер', 
      width: 120,
    },
    { 
      field: 'departure_datetime_formatted',
      headerName: 'Дата отправки', 
      flex: 1,
      minWidth: 140,
    },
    { 
      field: 'arrival_datetime_formatted',
      headerName: 'Дата прибытия', 
      flex: 1,
      minWidth: 140,
    },
    { 
      field: 'distance_formatted',
      headerName: 'Расстояние (км)', 
      width: 140,
    },
    { 
      field: 'duration_formatted',
      headerName: 'Длительность (ч)', 
      width: 150,
    },
    { 
      field: 'package_type_name', 
      headerName: 'Тип упаковки', 
      width: 140,
    },
    { 
      field: 'status', 
      headerName: 'Статус', 
      width: 140,
      renderCell: (params) => {
        return (
          <Chip
            label={params.row.status_name}
            sx={{
              backgroundColor: params.row.status_color || '#ccc',
              color: '#fff',
            }}
            size="small"
          />
        );
      },
    },
    { 
      field: 'services', 
      headerName: 'Услуги', 
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => {
        if (!params.value || !params.value.length) return '-';
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {params.value.map((service, index) => (
              <Chip
                key={index}
                label={service}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        );
      },
    },
  ];

  // Преобразуем данные с сервера для корректного отображения в DataGrid
  const rows = deliveries.map((delivery, index) => {
    // Предварительное форматирование дат, расстояния и длительности
    let departure_datetime_formatted = '';
    let arrival_datetime_formatted = '';
    let distance_formatted = '';
    let duration_formatted = '';

    try {
      if (delivery.departure_datetime) {
        departure_datetime_formatted = format(parseISO(delivery.departure_datetime), 'dd.MM.yyyy HH:mm', { locale: ru });
      }
    } catch (e) {
      console.error('Ошибка форматирования даты отправки:', e);
    }

    try {
      if (delivery.arrival_datetime) {
        arrival_datetime_formatted = format(parseISO(delivery.arrival_datetime), 'dd.MM.yyyy HH:mm', { locale: ru });
      }
    } catch (e) {
      console.error('Ошибка форматирования даты прибытия:', e);
    }

    try {
      if (delivery.distance != null) {
        distance_formatted = delivery.distance.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
    } catch (e) {
      console.error('Ошибка форматирования расстояния:', e);
    }

    try {
      if (delivery.duration != null) {
        duration_formatted = delivery.duration.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
    } catch (e) {
      console.error('Ошибка форматирования длительности:', e);
    }

    return {
      ...delivery,
      id: delivery.id || index,
      departure_datetime_formatted,
      arrival_datetime_formatted,
      distance_formatted,
      duration_formatted
    };
  });

  // Локализация для DataGrid
  const localeText = {
    noRowsLabel: 'Нет данных',
    noResultsOverlayLabel: 'Результаты не найдены.',
    errorOverlayDefaultLabel: 'Произошла ошибка.',

    // Панель инструментов
    toolbarDensity: 'Плотность',
    toolbarDensityLabel: 'Плотность',
    toolbarDensityCompact: 'Компактная',
    toolbarDensityStandard: 'Стандартная',
    toolbarDensityComfortable: 'Комфортная',

    // Фильтры
    toolbarFilters: 'Фильтры',
    toolbarFiltersLabel: 'Показать фильтры',
    toolbarFiltersTooltipHide: 'Скрыть фильтры',
    toolbarFiltersTooltipShow: 'Показать фильтры',
    toolbarQuickFilterPlaceholder: 'Поиск...',
    
    // Экспорт
    toolbarExport: 'Экспорт',
    toolbarExportLabel: 'Экспорт',
    toolbarExportCSV: 'Скачать CSV',
    
    // Колонки
    columnsPanelTextFieldLabel: 'Найти колонку',
    columnsPanelTextFieldPlaceholder: 'Заголовок колонки',
    columnsPanelShowAllButton: 'Показать все',
    columnsPanelHideAllButton: 'Скрыть все',
    
    // Пагинация
    footerRowSelected: (count) => count !== 1
      ? `${count.toLocaleString()} строк выбрано`
      : `${count.toLocaleString()} строка выбрана`,
    footerTotalRows: 'Всего строк:',
    
    // Пагинация
    MuiTablePagination: {
      labelRowsPerPage: 'Строк на странице:',
      labelDisplayedRows: ({ from, to, count }) =>
        `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`,
    },
  };

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        rowCount={totalCount}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        disableSelectionOnClick
        paginationMode="server"
        loading={rows.length === 0}
        localeText={localeText}
      />
    </Box>
  );
};

export default DeliveryTable;