import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import DeliveryFilters from '../components/DeliveryFilters';
import DeliveryTable from '../components/DeliveryTable';
import DeliveryChart from '../components/DeliveryChart';
import DeliveryStats from '../components/DeliveryStats';
import { getDeliveries, getDeliveryAnalytics } from '../services/deliveryService';
import { getDeliveryServices, getCargoTypes } from '../services/catalogService';

const DashboardPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [cargoTypes, setCargoTypes] = useState([]);
  const [filters, setFilters] = useState({
    start_date: format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    services: '',
    cargo_types: '',
    page: 1,
    page_size: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  // Загрузка справочников при монтировании компонента
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [servicesData, cargoTypesData] = await Promise.all([
          getDeliveryServices(),
          getCargoTypes(),
        ]);

        setServices(servicesData.results || []);
        setCargoTypes(cargoTypesData.results || []);
      } catch (err) {
        console.error('Ошибка при загрузке справочников:', err);
        setError('Не удалось загрузить данные справочников');
      }
    };

    fetchCatalogs();
  }, []);

  // Загрузка данных доставок при изменении фильтров
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Параллельные запросы на данные доставок и аналитику
        const [deliveriesData, analyticsData] = await Promise.all([
          getDeliveries(filters),
          getDeliveryAnalytics(filters),
        ]);
        
        setDeliveries(deliveriesData.results || []);
        setTotalDeliveries(deliveriesData.count || 0);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные доставок');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Сбрасываем страницу при изменении фильтров
    });
  };

  // Обработчик изменения страницы в таблице
  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page: page + 1, // MUI DataGrid использует нумерацию с 0
    });
  };

  // Обработчик изменения размера страницы
  const handlePageSizeChange = (pageSize) => {
    setFilters({
      ...filters,
      page_size: pageSize,
    });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Отчет по доставкам
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <DeliveryFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          services={services}
          cargoTypes={cargoTypes}
        />
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {analytics && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <DeliveryStats analytics={analytics} />
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Динамика доставок
                  </Typography>
                  <DeliveryChart analytics={analytics} />
                </Paper>
              </Grid>
            </Grid>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Список доставок
            </Typography>
            <DeliveryTable 
              deliveries={deliveries} 
              totalCount={totalDeliveries}
              page={filters.page - 1} // MUI DataGrid использует нумерацию с 0
              pageSize={filters.page_size}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default DashboardPage; 