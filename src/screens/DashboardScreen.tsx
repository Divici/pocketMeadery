import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDatabase } from '../context/DatabaseContext';
import {
  deleteReminder,
  deleteBatch,
  listActiveBatches,
  listNextReminderPerBatchWithBatchName,
  listUpcomingRemindersWithBatchName,
  updateReminder,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch } from '../db/types';
import { formatDateMMDDYYYY } from '../lib/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReminderWithBatchName } from '../db/repositories/reminderRepository';
import {
  cancelScheduledNotification,
  scheduleReminderNotification,
} from '../notifications/notificationService';

type Props = {
  onNewBatch: () => void;
  onBatchPress: (batchId: string) => void;
};

export function DashboardScreen({ onNewBatch, onBatchPress }: Props) {
  const insets = useSafeAreaInsets();
  const { db } = useDatabase();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [nextReminders, setNextReminders] = useState<ReminderWithBatchName[]>([]);
  const [allReminders, setAllReminders] = useState<ReminderWithBatchName[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status: Batch['status']) => {
    if (status === 'ACTIVE_PRIMARY') return 'Active';
    return status
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const load = useCallback(async () => {
    if (!db) return;
    const [b, preview, full] = await Promise.all([
      listActiveBatches(db),
      listNextReminderPerBatchWithBatchName(db, 50),
      listUpcomingRemindersWithBatchName(db, 200),
    ]);
    setBatches(b);
    setNextReminders(preview);
    setAllReminders(full);
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

  const handleDeleteReminder = useCallback(
    async (reminder: ReminderWithBatchName) => {
      if (!db) return;
      if (reminder.notification_id) {
        await cancelScheduledNotification(reminder.notification_id);
      }
      await deleteReminder(db, reminder.id);
      await load();
    },
    [db, load]
  );

  const handleSnoozeReminder = useCallback(
    async (reminder: ReminderWithBatchName) => {
      if (!db) return;
      const nextDay = reminder.scheduled_for + 24 * 60 * 60 * 1000;
      if (reminder.notification_id) {
        await cancelScheduledNotification(reminder.notification_id);
      }
      const newNotificationId = await scheduleReminderNotification(
        reminder.id,
        reminder.batch_id,
        reminder.title,
        reminder.body,
        nextDay
      );
      await updateReminder(db, reminder.id, {
        scheduled_for: nextDay,
        notification_id: newNotificationId,
      });
      await load();
    },
    [db, load]
  );

  const promptReminderAction = useCallback(
    (reminder: ReminderWithBatchName) => {
      Alert.alert('Reminder Action', reminder.title, [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleDeleteReminder(reminder);
          },
        },
        {
          text: 'Snooze',
          onPress: () => {
            void handleSnoozeReminder(reminder);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [handleDeleteReminder, handleSnoozeReminder]
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
        <View style={styles.reminderTitleRow}>
          <Text style={[styles.sectionTitle, styles.inlineSectionTitle]}>Next Reminders</Text>
        </View>
        {nextReminders.length === 0 ? (
          <Text style={styles.empty}>No upcoming reminders</Text>
        ) : (
          nextReminders.slice(0, 3).map((r) => (
            <Swipeable
              key={r.id}
              renderRightActions={() => (
                <Pressable
                  style={styles.reminderActionButton}
                  onPress={() => promptReminderAction(r)}
                >
                  <Text style={styles.reminderActionButtonText}>Actions</Text>
                </Pressable>
              )}
            >
              <View style={styles.reminderRow}>
                <MaterialIcons
                  name="notifications"
                  size={16}
                  color="#B22020"
                  style={styles.reminderRowBell}
                />
                <Text style={styles.reminderTitle}>
                  {(r.batch_name || 'Unknown Mead') + ': ' + r.title}
                </Text>
                <Text style={styles.reminderTime}>
                  {formatDateMMDDYYYY(r.scheduled_for)}
                </Text>
              </View>
            </Swipeable>
          ))
        )}
        {nextReminders.length > 3 && (
          <Pressable onPress={() => setShowReminderModal(true)} style={styles.showMoreBtn}>
            <Text style={styles.showMoreText}>Show more</Text>
          </Pressable>
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
                  <Pressable
                    style={styles.deleteAction}
                    onPress={() => handleDeleteBatch(item)}
                  >
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </Pressable>
                )}
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

      <Modal
        visible={showReminderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Reminders</Text>
              <Pressable onPress={() => setShowReminderModal(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView>
              {allReminders.map((r) => (
                <Swipeable
                  key={r.id}
                  renderRightActions={() => (
                    <Pressable
                      style={styles.reminderActionButton}
                      onPress={() => promptReminderAction(r)}
                    >
                      <Text style={styles.reminderActionButtonText}>Actions</Text>
                    </Pressable>
                  )}
                >
                  <View style={styles.modalReminderRow}>
                    <Text style={styles.reminderTitle}>
                      {(r.batch_name || 'Unknown Mead') + ': ' + r.title}
                    </Text>
                    <Text style={styles.reminderTime}>
                      {formatDateMMDDYYYY(r.scheduled_for)}
                    </Text>
                  </View>
                </Swipeable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inlineSectionTitle: {
    marginBottom: 0,
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
    alignItems: 'center',
    backgroundColor: '#D4A843',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  reminderRowBell: {
    marginRight: 8,
  },
  reminderTitle: {
    flex: 1,
    fontSize: 14,
    color: '#B22020',
    fontWeight: '700',
  },
  reminderTime: {
    fontSize: 12,
    color: '#B22020',
    marginTop: 2,
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
  showMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    color: lightTheme.primary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalCard: {
    maxHeight: '70%',
    backgroundColor: lightTheme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: lightTheme.primary,
  },
  closeText: {
    color: lightTheme.primary,
    fontWeight: '600',
  },
  modalReminderRow: {
    backgroundColor: '#D4A843',
    borderWidth: 1,
    borderColor: '#D4A843',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reminderActionButton: {
    width: 96,
    marginBottom: 8,
    marginLeft: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8A5A16',
  },
  reminderActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
