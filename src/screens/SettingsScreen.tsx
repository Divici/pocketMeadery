import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import { getSetting, setSetting } from '../db/repositories/appSettingsRepository';
import { lightTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const UNITS_KEY = 'units';
type UnitsValue = 'US' | 'metric';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { db } = useDatabase();
  const [units, setUnitsState] = useState<UnitsValue>('US');

  const load = useCallback(async () => {
    if (!db) return;
    const v = await getSetting(db, UNITS_KEY);
    setUnitsState((v as UnitsValue) ?? 'US');
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const setUnits = useCallback(
    async (value: UnitsValue) => {
      if (!db) return;
      await setSetting(db, UNITS_KEY, value);
      setUnitsState(value);
    },
    [db]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Units</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.option, units === 'US' && styles.optionSelected]}
            onPress={() => setUnits('US')}
          >
            <Text
              style={[
                styles.optionText,
                units === 'US' && styles.optionTextSelected,
              ]}
            >
              US
            </Text>
          </Pressable>
          <Pressable
            style={[styles.option, units === 'metric' && styles.optionSelected]}
            onPress={() => setUnits('metric')}
          >
            <Text
              style={[
                styles.optionText,
                units === 'metric' && styles.optionTextSelected,
              ]}
            >
              Metric
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: lightTheme.primary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: lightTheme.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  optionSelected: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  optionText: {
    fontSize: 14,
    color: lightTheme.text,
  },
  optionTextSelected: {
    color: '#fff',
  },
});
