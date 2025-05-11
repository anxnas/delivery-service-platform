import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Divider,
} from '@mui/material';
import {
  LocalShipping,
  Route,
  CheckCircleOutline,
  Settings,
  Inventory,
} from '@mui/icons-material';

const DeliveryStats = ({ analytics }) => {
  // Если нет данных, выводим пустой блок
  if (!analytics) {
    return null;
  }

  // Компонент для отдельного блока статистики
  const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: `${color}20`,
          color: color,
          mr: 1,
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Paper>
  );

  // Вычисляем общее количество доставок по статусам
  const statusDeliveries = analytics.status_stats.reduce((acc, stat) => acc + (stat.count || 0), 0);
  
  // Находим топовые модели транспорта
  const topTransport = analytics.transport_stats && analytics.transport_stats.length > 0
    ? analytics.transport_stats.sort((a, b) => b.count - a.count)[0]
    : null;
    
  // Находим топовые услуги
  const topService = analytics.service_stats && analytics.service_stats.length > 0
    ? analytics.service_stats.sort((a, b) => b.count - a.count)[0]
    : null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Всего доставок" 
          value={analytics.total_deliveries.toLocaleString('ru-RU')}
          icon={<LocalShipping />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Суммарное расстояние (км)" 
          value={analytics.total_distance.toLocaleString('ru-RU', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
          })}
          icon={<Route />}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Популярный статус" 
          value={analytics.status_stats && analytics.status_stats.length > 0 
            ? `${analytics.status_stats[0].status__name} (${((analytics.status_stats[0].count / statusDeliveries) * 100).toFixed(0)}%)`
            : 'Нет данных'
          }
          icon={<CheckCircleOutline />}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Популярный транспорт" 
          value={topTransport 
            ? `${topTransport.transport_model__name}` 
            : 'Нет данных'
          }
          icon={<Settings />}
          color="#9c27b0"
        />
      </Grid>
      
      {/* Дополнительная детальная статистика */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Детальная статистика
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Статистика по статусам
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {analytics.status_stats && analytics.status_stats.map((status, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: status.status__color || '#ccc',
                          mr: 1,
                        }} 
                      />
                      <Typography variant="body2">
                        {status.status__name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {status.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Статистика по услугам
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {analytics.service_stats && analytics.service_stats.map((service, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Inventory fontSize="small" sx={{ mr: 1, color: '#2196f3' }} />
                      <Typography variant="body2">
                        {service.services__name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {service.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DeliveryStats; 