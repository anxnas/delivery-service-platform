import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

export const theme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    error: '#B3261E',
    background: '#1C1B1F',
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    surfaceVariant: '#49454F',
  },
  fonts: configureFonts({ config: fontConfig }),
}; 