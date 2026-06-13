import { useColorScheme } from 'react-native';

export const darkTheme = {
  bg: '#000000',
  card: '#0D0D0D',
  card2: '#111111',
  card3: '#161616',
  border: '#1A1A1A',
  border2: '#222222',
  text: '#FFFFFF',
  textSub: '#888888',
  textMuted: '#666666',
  textFaint: '#444444',
  textFaintest: '#333333',
  placeholder: '#444444',
  accent: '#00E5A0',
  orange: '#FFB020',
  danger: '#FF4444',
  overlay: 'rgba(0,0,0,0.85)',
};

export const lightTheme = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  card2: '#F8F8F8',
  card3: '#EFEFEF',
  border: '#E0E0E0',
  border2: '#CCCCCC',
  text: '#000000',
  textSub: '#555555',
  textMuted: '#777777',
  textFaint: '#999999',
  textFaintest: '#BBBBBB',
  placeholder: '#999999',
  accent: '#00C484',
  orange: '#E09000',
  danger: '#FF3333',
  overlay: 'rgba(0,0,0,0.5)',
};

export type Theme = typeof darkTheme;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
}
