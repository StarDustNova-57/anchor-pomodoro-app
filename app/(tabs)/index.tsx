import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StyleSheet, Pressable, AppState, Animated, View} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect, useRef } from 'react';

/* ---------- helpers ---------- */
const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

const FOCUS_COLORS: Record<string, string> = {
  sage: '#9DB8A0',
  teal: '#7FAFB3',
  mistyBlue: '#9FB6D0',
  lavenderGray: '#B6B2C6',
  warmBeige: '#D6CFC4',
};
/* ----------------------------- */

export default function HomeScreen() {
  const DEFAULT_FOCUS_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const LONG_BREAK_DURATION = 20 * 60;
  const MAX_POMODOROS = 4;

  const BREAK_SUGGESTIONS: Record<string, string[]> = {
  'Light movement or stretching': [
    'Stand up and walk around for a few minutes',
    'Walk to another room and back',
    'Stretch your legs and lower back',
    'Loosen stiff joints with simple stretches',
    'Do a quick posture reset',
    'Move around a bit',
    'Step away from your desk briefly',
    'Stretch your arms and shoulders',
  ],

  'Quiet rest': [
    'Look away from the screen for a few minutes',
    'Focus on something far away',
    'Rest your eyes without using a phone',
    'Sit quietly and do nothing',
    'Clear your head before resuming',
    'Pause and reset your focus',
    'Mentally switch contexts for a few minutes',
    'Reduce screen brightness briefly',
  ],

  'Music or audio': [
    'Listen to one song you enjoy',
    'Play light background music',
    'Listen to instrumental or ambient audio',
    'Put on something familiar and relaxing',
    'Listen without doing anything else',
  ],

  'Creative or hands-on activities': [
    'Tidy your desk or workspace',
    'Organize something small nearby',
    'Refill your water bottle',
    'Check something off your personal to-do list',
    'Build or fiddle with something',
    'Do a small hands-on task',
  ],

  default: [
    'Drink water or make a hot drink',
    'Step away from your work completely',
    'Take a short break from screens',
    'Breathe and reset',
  ],
};

  
  const [lastBreakSuggestion, setLastBreakSuggestion] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [mode, setMode] = useState<'idle' | 'focus' | 'break'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_DURATION);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const appState = useRef(AppState.currentState);
  const [awaySince, setAwaySince] = useState<number | null>(null);
  const [breakSuggestion, setBreakSuggestion] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [breakPreference, setBreakPreference] = useState<string | null>(null);
  const [distractionThreshold, setDistractionThreshold] = useState(300);
  const [focusColor, setFocusColor] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- Load preferences ---------- */
  useEffect(() => {
    const loadPreferences = async () => {
      const storedDuration = await AsyncStorage.getItem('focusDuration');
      const onboardingDone = await AsyncStorage.getItem('hasCompletedOnboarding');
      const storedBreakPreference = await AsyncStorage.getItem('breakPreference');
      const storedFlexibility = await AsyncStorage.getItem('flexibilityLevel');
      const storedFocusColor = await AsyncStorage.getItem('focusColor');

      if (storedFlexibility === 'Gentle guidance') setDistractionThreshold(480);
      else if (storedFlexibility === 'Balanced structure') setDistractionThreshold(300);
      else if (storedFlexibility === 'Clear structure') setDistractionThreshold(180);

      if (storedDuration) {
        const seconds = parseInt(storedDuration, 10) * 60;
        setFocusDuration(seconds);
        setSecondsLeft(seconds);
      }

      if (onboardingDone === 'true') setHasCompletedOnboarding(true);
      if (storedBreakPreference) setBreakPreference(storedBreakPreference);

      if (storedFocusColor && FOCUS_COLORS[storedFocusColor]) {
        setFocusColor(FOCUS_COLORS[storedFocusColor]);
      }

      setIsReady(true);
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding/focus-duration');
    }
  }, [isReady, hasCompletedOnboarding]);

  useEffect(() => {
    if (mode === 'break' && breakSuggestion) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [mode, breakSuggestion]);

  useEffect(() => {
    if (mode === 'idle') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (mode === 'focus') {
            const nextCount = pomodoroCount + 1;
            setPomodoroCount(nextCount);

            const pool =
              BREAK_SUGGESTIONS[breakPreference ?? 'default'] ??
              BREAK_SUGGESTIONS.default;

            let nextSuggestion = pool[Math.floor(Math.random() * pool.length)];

            if (pool.length > 1 && nextSuggestion === lastBreakSuggestion) {
              nextSuggestion = pool.find(s => s !== lastBreakSuggestion) ?? nextSuggestion;
            }

            setLastBreakSuggestion(nextSuggestion);
            setBreakSuggestion(nextSuggestion);

                setMode('break');

            return nextCount >= MAX_POMODOROS
              ? LONG_BREAK_DURATION
              : BREAK_DURATION;
          }

          if (mode === 'break') {
            setBreakSuggestion(null);

            if (pomodoroCount >= MAX_POMODOROS) {
              setPomodoroCount(0);
              setMode('idle');
              return focusDuration;
            }

            setMode('focus');
            return focusDuration;
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, pomodoroCount, focusDuration, breakPreference]);

  if (!isReady) return null;

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(
    secondsLeft % 60
  ).padStart(2, '0')}`;

  return (
    <ThemedView style={{ flex: 1 }}>
    <View
      style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor:
        mode === 'focus' && focusColor
          ? `rgba(${hexToRgb(focusColor)}, 0.90)`
          : 'transparent',
        }}
      >

      {mode === 'focus' && (
  <Pressable
    onPress={() => setShowColorPicker(true)}
    style={{
      position: 'absolute',
      top: 48,
      right: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: '#1F2937',
      zIndex: 10,
    }}
  >
    <ThemedText style={{ fontSize: 13, color: '#E5E7EB' }}>
      Style
    </ThemedText>
  </Pressable>
)}

      <ThemedText type="title">
        {mode === 'idle' ? 'Anchor' : formattedTime}
      </ThemedText>

      <ThemedText style={{ marginTop: 8 }}>
        {mode === 'focus'
          ? 'Focus in progress'
          : mode === 'break'
          ? pomodoroCount >= MAX_POMODOROS
            ? 'Take a long break'
            : 'Take a short break'
          : 'Stay until the session ends.'}
      </ThemedText>

      {mode === 'break' && breakSuggestion && (
        <Animated.Text
          style={{
            marginTop: 16,
            fontSize: 16,
            opacity: fadeAnim,
            color: '#9CA3AF',
            textAlign: 'center',
          }}
        >
          {breakSuggestion}
        </Animated.Text>
      )}

      <Pressable
        disabled={mode !== 'idle'}
        onPress={() => {
          setPomodoroCount(0);
          setSecondsLeft(focusDuration);
          setMode('focus');
        }}
        style={{
          marginTop: 32,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 30,
          backgroundColor: mode === 'focus' ? '#374151' : '#1F2937',
          opacity: mode === 'focus' ? 0.6 : 1,
        }}
      >
        <ThemedText style={{ color: '#FFFFFF' }}>
          {mode === 'focus'
            ? 'Focusing…'
            : mode === 'break'
            ? 'On Break'
            : 'Start Focus Session'}
        </ThemedText>
      </Pressable>
      {showColorPicker && (
  <ThemedView
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: '#111827',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      zIndex: 20,
    }}
  >
    <ThemedText style={{ marginBottom: 12, opacity: 0.7 }}>
      Choose a color
    </ThemedText>

    <ThemedView style={{ flexDirection: 'row', gap: 14 }}>
      {Object.entries(FOCUS_COLORS).map(([key, color]) => (
        <Pressable
          key={key}
          onPress={async () => {
            await AsyncStorage.setItem('focusColor', key);
            setFocusColor(color);
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: color,
            borderWidth: focusColor === color ? 2 : 0,
            borderColor: '#FFFFFF',
          }}
        />
      ))}
    </ThemedView>

    <Pressable
      onPress={() => setShowColorPicker(false)}
      style={{ marginTop: 16, alignSelf: 'flex-end' }}
    >
      <ThemedText style={{ opacity: 0.6 }}>Done</ThemedText>
    </Pressable>
  </ThemedView>
)}
     </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
