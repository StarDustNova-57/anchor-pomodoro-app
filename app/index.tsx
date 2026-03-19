import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const decide = async () => {
      const hasCompletedOnboarding =
        await AsyncStorage.getItem('hasCompletedOnboarding');

      if (hasCompletedOnboarding !== 'true') {
        router.replace('/onboarding/focus-duration');
      } else {
        router.replace('/(tabs)');
      }
    };

    decide();
  }, []);

  return <View />;
}
