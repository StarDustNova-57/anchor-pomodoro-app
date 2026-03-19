import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '25 minutes', value: 25 },
  { label: '45 minutes', value: 45 },
  { label: '60+ minutes', value: 60 },
];

export default function FocusDurationScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        How long can you focus comfortably?
      </ThemedText>

      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setSelected(option.value)}
          style={[
            styles.option,
            selected === option.value && styles.optionSelected,
          ]}
        >
          <ThemedText
            style={[
                styles.optionText,
                selected === option.value && { color: '#FFFFFF' },
            ]}
            >
            {option.label}
        </ThemedText>

        </Pressable>
      ))}

      <Pressable
        disabled={selected === null}
        onPress={async () => {
        if (selected !== null) {
          await AsyncStorage.setItem(
          'focusDuration',
        selected.toString()
      );
      router.push('/onboarding/break-preference');
    }
  }}
  style={[
    styles.continueButton,
    selected === null && styles.disabled,
  ]}
>

        <ThemedText style={styles.continueText}>
          Continue
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
