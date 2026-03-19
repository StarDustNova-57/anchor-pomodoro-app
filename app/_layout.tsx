import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] =
    useState<'light' | 'dark' | 'system'>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('themePreference');

      if (
        storedTheme === 'light' ||
        storedTheme === 'dark' ||
        storedTheme === 'system'
      ) {
        setThemePreference(storedTheme);
      }

      setReady(true);
    };

    loadTheme();
  }, []);

  const activeTheme =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? DarkTheme
        : DefaultTheme
      : themePreference === 'dark'
      ? DarkTheme
      : DefaultTheme;

  if (!ready) return null;

  return (
    <ThemeProvider value={activeTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
