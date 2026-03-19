import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const OPTIONS = [
  'Gentle guidance',
  'Balanced structure',
  'Clear structure',
];

export default function FlexibilityLevelScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        How guided do you want focus sessions to feel?
      </ThemedText>

      {OPTIONS.map((option) => (
        <Pressable
          key={option}
          onPress={() => setSelected(option)}
          style={[
            styles.option,
            selected === option && styles.optionSelected,
          ]}
        >
          <ThemedText
            style={[
              styles.optionText,
              selected === option && { color: '#FFFFFF' },
            ]}
          >
            {option}
          </ThemedText>
        </Pressable>
      ))}

      <Pressable
        disabled={!selected}
        onPress={async () => {
          if (!selected) return;

          await AsyncStorage.setItem('flexibilityLevel', selected);
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

          router.replace('/');
        }}
        style={[
          styles.continueButton,
          !selected && styles.disabled,
        ]}
      >
        <ThemedText style={styles.continueText}>
          Finish
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#374151',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: '#1F2937',
  },
  disabled: {
    opacity: 0.4,
  },
  continueText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
});
