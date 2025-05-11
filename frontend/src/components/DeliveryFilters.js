import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';

const DeliveryFilters = ({ filters, onFilterChange, services = [], cargoTypes = [] }) => {
  // Локальное состояние для формы фильтров
  const [localFilters, setLocalFilters] = useState({
    start_date: filters.start_date ? parse(filters.start_date, 'yyyy-MM-dd', new Date()) : null,
    end_date: filters.end_date ? parse(filters.end_date, 'yyyy-MM-dd', new Date()) : null,
    services: filters.services ? filters.services.split(',') : [],
    cargo_types: filters.cargo_types ? filters.cargo_types.split(',') : [],
  });

  // Обновление локальных фильтров при изменении props
  useEffect(() => {
    setLocalFilters({
      start_date: filters.start_date ? parse(filters.start_date, 'yyyy-MM-dd', new Date()) : null,
      end_date: filters.end_date ? parse(filters.end_date, 'yyyy-MM-dd', new Date()) : null,
      services: filters.services ? filters.services.split(',') : [],
      cargo_types: filters.cargo_types ? filters.cargo_types.split(',') : [],
    });
  }, [filters]);

  // Обработчик изменения даты
  const handleDateChange = (name) => (date) => {
    setLocalFilters({
      ...localFilters,
      [name]: date,
    });
  };

  // Обработчик изменения мультиселекта
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  // Обработчик сброса фильтров
  const handleReset = () => {
    const defaultFilters = {
      start_date: parse(format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()),
      end_date: parse(format(new Date(), 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()),
      services: [],
      cargo_types: [],
    };
    
    setLocalFilters(defaultFilters);
    
    // Передаем в родительский компонент
    onFilterChange({
      start_date: format(defaultFilters.start_date, 'yyyy-MM-dd'),
      end_date: format(defaultFilters.end_date, 'yyyy-MM-dd'),
      services: '',
      cargo_types: '',
    });
  };

  // Обработчик применения фильтров
  const handleApply = () => {
    onFilterChange({
      start_date: localFilters.start_date ? format(localFilters.start_date, 'yyyy-MM-dd') : '',
      end_date: localFilters.end_date ? format(localFilters.end_date, 'yyyy-MM-dd') : '',
      services: localFilters.services.join(','),
      cargo_types: localFilters.cargo_types.join(','),
    });
  };

  // Подсчет активных фильтров
  const activeFiltersCount = [
    localFilters.services.length > 0,
    localFilters.cargo_types.length > 0,
  ].filter(Boolean).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filter-panel-content"
          id="filter-panel-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Фильтры</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount}`}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата начала"
                value={localFilters.start_date}
                onChange={handleDateChange('start_date')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Дата окончания"
                value={localFilters.end_date}
                onChange={handleDateChange('end_date')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="services-label">Услуги</InputLabel>
                <Select
                  labelId="services-label"
                  id="services"
                  name="services"
                  multiple
                  value={localFilters.services}
                  onChange={handleMultiSelectChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const service = services.find(s => s.id === value);
                        return (
                          <Chip key={value} label={service ? service.name : value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="cargo-types-label">Типы груза</InputLabel>
                <Select
                  labelId="cargo-types-label"
                  id="cargo-types"
                  name="cargo_types"
                  multiple
                  value={localFilters.cargo_types}
                  onChange={handleMultiSelectChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const cargoType = cargoTypes.find(ct => ct.id === value);
                        return (
                          <Chip key={value} label={cargoType ? cargoType.name : value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {cargoTypes.map((cargoType) => (
                    <MenuItem key={cargoType.id} value={cargoType.id}>
                      {cargoType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleReset}>
                  Сбросить
                </Button>
                <Button variant="contained" color="primary" onClick={handleApply}>
                  Применить
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </LocalizationProvider>
  );
};

export default DeliveryFilters; 