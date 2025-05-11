import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Регистрация компонентов ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DeliveryChart = ({ analytics }) => {
  const [chartType, setChartType] = React.useState('line');

  const handleChangeChartType = (event, newValue) => {
    setChartType(newValue);
  };

  // Если нет данных, возвращаем сообщение
  if (!analytics || !analytics.daily_stats || analytics.daily_stats.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Нет данных для отображения графика
        </Typography>
      </Box>
    );
  }

  // Обработка данных для графика
  const dailyStats = analytics.daily_stats;
  const labels = dailyStats.map(stat => 
    format(parseISO(stat.date), 'dd MMM', { locale: ru })
  );

  // Данные для линейного графика
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Количество доставок',
        data: dailyStats.map(stat => stat.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2,
      },
      {
        label: 'Среднее расстояние (км)',
        data: dailyStats.map(stat => stat.avg_distance),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.2,
        yAxisID: 'y1',
      },
    ],
  };

  // Данные для столбчатого графика
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Количество доставок',
        data: dailyStats.map(stat => stat.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Суммарное расстояние (км)',
        data: dailyStats.map(stat => stat.total_distance),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  // Опции для графиков
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Количество доставок',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: chartType === 'line' ? 'Среднее расстояние (км)' : 'Суммарное расстояние (км)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Статистика доставок по дням',
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('ru-RU', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              });
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={chartType} 
          onChange={handleChangeChartType} 
          aria-label="chart type tabs"
          centered
        >
          <Tab label="Линейный график" value="line" />
          <Tab label="Столбчатый график" value="bar" />
        </Tabs>
      </Box>
      
      <Box sx={{ height: 400 }}>
        {chartType === 'line' ? (
          <Line data={lineChartData} options={options} />
        ) : (
          <Bar data={barChartData} options={options} />
        )}
      </Box>
    </Box>
  );
};

export default DeliveryChart; 