import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDatabase } from '../context/DatabaseContext';
import {
  deleteBatch,
  listActiveBatches,
  listUpcomingReminders,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch, Reminder } from '../db/types';
import { formatDateMMDDYYYY } from '../lib/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onNewBatch: () => void;
  onBatchPress: (batchId: string) => void;
};

export function DashboardScreen({ onNewBatch, onBatchPress }: Props) {
  const insets = useSafeAreaInsets();
  const { db } = useDatabase();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status: Batch['status']) => {
    if (status === 'ACTIVE_PRIMARY') return 'Active';
    return status.replace('_', ' ');
  };

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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDeleteBatch = useCallback(
    (batch: Batch) => {
      if (!db) return;
      Alert.alert(
        'Delete Batch',
        `Are you sure you want to delete "${batch.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteBatch(db, batch.id);
              await load();
            },
          },
        ]
      );
    },
    [db, load]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
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

      <View style={[styles.section, styles.activeSection]}>
        <Text style={styles.sectionTitle}>Active Batches</Text>
        {batches.length === 0 ? (
          <Text style={styles.empty}>No active batches</Text>
        ) : (
          <FlatList
            data={batches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.batchListContent}
            renderItem={({ item }) => (
              <Swipeable
                renderRightActions={() => (
                  <View style={styles.deleteAction}>
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </View>
                )}
                onSwipeableOpen={() => handleDeleteBatch(item)}
              >
                <Pressable
                  style={styles.batchCard}
                  onPress={() => onBatchPress(item.id)}
                >
                  <Text style={styles.batchName}>{item.name}</Text>
                  <Text style={styles.batchMeta}>
                    {getStatusLabel(item.status)} • {formatDateMMDDYYYY(item.updated_at)}
                  </Text>
                  {item.current_abv != null && (
                    <Text style={styles.batchAbv}>
                      ABV: {item.current_abv.toFixed(1)}%
                    </Text>
                  )}
                </Pressable>
              </Swipeable>
            )}
          />
        )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
  section: {
    marginBottom: 24,
  },
  activeSection: {
    flex: 1,
    marginBottom: 0,
  },
  batchListContent: {
    paddingBottom: 16,
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
  deleteAction: {
    width: 88,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B22020',
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '700',
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
    marginBottom: 20,
  },
  newBatchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
