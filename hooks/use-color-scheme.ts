import { useTheme } from '@react-navigation/native';

export function useColorScheme(): 'light' | 'dark' {
  const theme = useTheme();
  return theme.dark ? 'dark' : 'light';
}
