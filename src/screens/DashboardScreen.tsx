import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import {
  listActiveBatches,
  listUpcomingReminders,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch, Reminder } from '../db/types';
import { formatDateMMDDYYYY } from '../lib/date';

type Props = {
  onNewBatch: () => void;
  onBatchPress: (batchId: string) => void;
};

export function DashboardScreen({ onNewBatch, onBatchPress }: Props) {
  const { db } = useDatabase();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db) return;
    const [b, r] = await Promise.all([
      listActiveBatches(db),
      listUpcomingReminders(db, 3),
    ]);
    setBatches(b);
    setReminders(r);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Batches</Text>
        {batches.length === 0 ? (
          <Text style={styles.empty}>No active batches</Text>
        ) : (
          <FlatList
            data={batches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.batchCard}
                onPress={() => onBatchPress(item.id)}
              >
                <Text style={styles.batchName}>{item.name}</Text>
                <Text style={styles.batchMeta}>
                  {item.status} • {formatDateMMDDYYYY(item.updated_at)}
                </Text>
                {item.current_abv != null && (
                  <Text style={styles.batchAbv}>
                    ABV: {item.current_abv.toFixed(1)}%
                  </Text>
                )}
              </Pressable>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Reminders</Text>
        {reminders.length === 0 ? (
          <Text style={styles.empty}>No upcoming reminders</Text>
        ) : (
          reminders.map((r) => (
            <View key={r.id} style={styles.reminderRow}>
              <Text style={styles.reminderTitle}>{r.title}</Text>
              <Text style={styles.reminderTime}>
                {formatDateMMDDYYYY(r.scheduled_for)}
              </Text>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.newBatchBtn} onPress={onNewBatch}>
        <Text style={styles.newBatchBtnText}>New Batch</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.primary,
    marginBottom: 8,
  },
  empty: {
    color: lightTheme.muted,
    fontStyle: 'italic',
  },
  batchCard: {
    backgroundColor: lightTheme.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
    marginBottom: 8,
  },
  batchName: {
    fontSize: 16,
    fontWeight: '600',
    color: lightTheme.text,
  },
  batchMeta: {
    fontSize: 12,
    color: lightTheme.muted,
    marginTop: 4,
  },
  batchAbv: {
    fontSize: 12,
    color: lightTheme.accent,
    marginTop: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.border,
  },
  reminderTitle: {
    fontSize: 14,
    color: lightTheme.text,
  },
  reminderTime: {
    fontSize: 12,
    color: lightTheme.muted,
  },
  newBatchBtn: {
    backgroundColor: lightTheme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  newBatchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
