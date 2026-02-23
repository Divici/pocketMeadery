export type ThemeColors = {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  border: string;
  text: string;
  muted: string;
};

export const lightTheme: ThemeColors = {
  background: '#F6F0E3',
  surface: '#FFFFFF',
  primary: '#6B1F1A',
  accent: '#E4B95E',
  border: '#E2D7C3',
  text: '#2F211B',
  muted: '#6E5A4F',
};

export const darkTheme: ThemeColors = {
  background: '#1C1412',
  surface: '#2A201C',
  primary: '#9E3B34',
  accent: '#D4A843',
  border: '#3A2B26',
  text: '#F1E8E2',
  muted: '#BCAEA6',
};
