import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../context/DatabaseContext';
import {
  deleteReminder,
  getBatchById,
  getSetting,
  listIngredientsByBatch,
  listStepsByBatch,
  listUpcomingRemindersByBatch,
  updateBatch,
  updateReminder,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch, BatchStatus, Ingredient, Reminder, Step } from '../db/types';
import { formatDateMMDDYYYY, parseDateMMDDYYYY } from '../lib/date';
import { formatAmountForDisplay, type UnitsPreference } from '../lib/units';
import {
  cancelScheduledNotification,
  scheduleReminderNotification,
} from '../notifications/notificationService';

type Props = {
  batchId: string;
  onAddStep: (batchId: string) => void;
  onAddIngredient: (batchId: string) => void;
  onAddReminder: (batchId: string, batchName?: string) => void;
  onEditStep?: (stepId: string) => void;
  onEditIngredient?: (ingredientId: string) => void;
};

export function BatchDetailScreen({
  batchId,
  onAddStep,
  onAddIngredient,
  onAddReminder,
  onEditStep,
  onEditIngredient,
}: Props) {
  const STATUSES: BatchStatus[] = [
    'ACTIVE_PRIMARY',
    'SECONDARY',
    'AGING',
    'BOTTLED',
    'ARCHIVED',
  ];
  const { db } = useDatabase();
  const insets = useSafeAreaInsets();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unitsPreference, setUnitsPreference] = useState<UnitsPreference>('US');
  const [createdDateInput, setCreatedDateInput] = useState('');
  const [goalAbvInput, setGoalAbvInput] = useState('');
  const [editingCreatedDate, setEditingCreatedDate] = useState(false);
  const [editingGoalAbv, setEditingGoalAbv] = useState(false);
  const [openSection, setOpenSection] = useState<'timeline' | 'ingredients'>('timeline');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db) return;
    const [b, s, i, r, units] = await Promise.all([
      getBatchById(db, batchId),
      listStepsByBatch(db, batchId),
      listIngredientsByBatch(db, batchId),
      listUpcomingRemindersByBatch(db, batchId, 200),
      getSetting(db, 'units'),
    ]);
    setBatch(b ?? null);
    setSteps(s);
    setIngredients(i);
    setReminders(r);
    setUnitsPreference(units === 'metric' ? 'metric' : 'US');
    if (b) {
      setCreatedDateInput(formatDateMMDDYYYY(b.created_at));
      setGoalAbvInput(b.goal_abv != null ? String(b.goal_abv) : '');
    }
    setLoading(false);
  }, [db, batchId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const getStatusLabel = (status: BatchStatus) => {
    if (status === 'ACTIVE_PRIMARY') return 'Active';
    return status
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleStatusUpdate = useCallback(
    async (status: BatchStatus) => {
      if (!db || !batch || batch.status === status) return;
      await updateBatch(db, batch.id, { status });
      await load();
    },
    [db, batch, load]
  );

  const saveCreatedDate = useCallback(async () => {
    if (!db || !batch) return;
    const created = parseDateMMDDYYYY(createdDateInput.trim());
    if (created == null) {
      setCreatedDateInput(formatDateMMDDYYYY(batch.created_at));
      setEditingCreatedDate(false);
      return;
    }
    await updateBatch(db, batch.id, { created_at: created });
    setEditingCreatedDate(false);
    await load();
  }, [db, batch, createdDateInput, load]);

  const saveGoalAbv = useCallback(async () => {
    if (!db || !batch) return;
    const parsedGoal = goalAbvInput.trim();
    const nextValue = parsedGoal ? parseFloat(parsedGoal) : null;
    if (parsedGoal && Number.isNaN(nextValue)) {
      setGoalAbvInput(batch.goal_abv != null ? String(batch.goal_abv) : '');
      setEditingGoalAbv(false);
      return;
    }
    await updateBatch(db, batch.id, { goal_abv: nextValue });
    setEditingGoalAbv(false);
    await load();
  }, [db, batch, goalAbvInput, load]);

  const handleDeleteReminder = useCallback(
    async (reminder: Reminder) => {
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
    async (reminder: Reminder) => {
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
    (reminder: Reminder) => {
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

  if (loading || !batch) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          {reminders.length > 0 && (
            <View style={styles.remindersSection}>
              <ScrollView
                style={[
                  styles.remindersScroll,
                  { height: Math.min(reminders.length, 2) * 64 },
                ]}
                nestedScrollEnabled
              >
                {reminders.map((reminder) => (
                  <Swipeable
                    key={reminder.id}
                    renderRightActions={() => (
                      <Pressable
                        style={styles.reminderSwipeAction}
                        onPress={() => promptReminderAction(reminder)}
                      >
                        <Text style={styles.reminderSwipeActionText}>Actions</Text>
                      </Pressable>
                    )}
                  >
                    <View style={styles.reminderBanner}>
                      <View style={styles.reminderBannerContent}>
                        <MaterialIcons
                          name="notifications"
                          size={18}
                          color="#B22020"
                          style={styles.reminderBell}
                        />
                        <Text style={styles.reminderBannerText}>
                          {formatReminderText(reminder)}
                        </Text>
                        <MaterialIcons
                          name="notifications"
                          size={18}
                          color="#B22020"
                          style={styles.reminderBell}
                        />
                      </View>
                    </View>
                  </Swipeable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.headerContent}>
            <Text style={styles.name}>{batch.name}</Text>
            <View style={styles.statusChips}>
              {STATUSES.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => handleStatusUpdate(status)}
                  style={[
                    styles.statusChip,
                    batch.status === status && styles.statusChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      batch.status === status && styles.statusChipTextSelected,
                    ]}
                  >
                    {getStatusLabel(status)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>Created </Text>
              {editingCreatedDate ? (
                <TextInput
                  style={styles.inlineInput}
                  value={createdDateInput}
                  onChangeText={setCreatedDateInput}
                  onSubmitEditing={saveCreatedDate}
                  onBlur={saveCreatedDate}
                  autoFocus
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={lightTheme.muted}
                />
              ) : (
                <Pressable onPress={() => setEditingCreatedDate(true)}>
                  <Text style={styles.inlineEditableText}>
                    {formatDateMMDDYYYY(batch.created_at)}
                  </Text>
                </Pressable>
              )}
            </View>
            {batch.batch_volume_value != null && batch.batch_volume_unit && (
              <Text style={styles.meta}>
                Volume:{' '}
                {formatAmountForDisplay(
                  batch.batch_volume_value,
                  batch.batch_volume_unit,
                  unitsPreference
                )}
              </Text>
            )}
            <View style={styles.abvRow}>
              {editingGoalAbv ? (
                <TextInput
                  style={styles.inlineInput}
                  value={goalAbvInput}
                  onChangeText={setGoalAbvInput}
                  onSubmitEditing={saveGoalAbv}
                  onBlur={saveGoalAbv}
                  autoFocus
                  placeholder="Goal ABV"
                  placeholderTextColor={lightTheme.muted}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Pressable onPress={() => setEditingGoalAbv(true)}>
                  <Text style={styles.goalAbv}>
                    Goal: {batch.goal_abv != null ? `${batch.goal_abv}% ABV` : '—'}
                  </Text>
                </Pressable>
              )}
              {batch.expected_abv != null && (
                <Text style={styles.abv}>Expected: {batch.expected_abv.toFixed(1)}%</Text>
              )}
              {batch.current_abv != null && (
                <Text style={styles.abv}>Current: {batch.current_abv.toFixed(1)}%</Text>
              )}
              {batch.goal_abv == null &&
                batch.expected_abv == null &&
                batch.current_abv == null && <Text style={styles.abv}>ABV: —</Text>}
            </View>
          </View>
        </View>

        <View style={styles.sectionsArea}>
          <Pressable
            style={[styles.tabHeader, openSection === 'ingredients' && styles.tabHeaderActive]}
            onPress={() => setOpenSection('ingredients')}
          >
            <Text
              style={[
                styles.tabHeaderText,
                openSection === 'ingredients' && styles.tabHeaderTextActive,
              ]}
            >
              Ingredients
            </Text>
          </Pressable>
          {openSection === 'ingredients' && (
            <View style={styles.tabContentFrame}>
              {ingredients.length === 0 ? (
                <Text style={styles.empty}>No ingredients</Text>
              ) : (
                <FlatList
                  style={styles.tabList}
                  data={ingredients}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: ing }) => (
                    <View style={styles.ingredientRow}>
                      <View>
                        <Text style={styles.ingredientName}>{ing.name}</Text>
                        {ing.amount_value != null && (
                          <Text style={styles.ingredientAmount}>
                            {formatAmountForDisplay(
                              ing.amount_value,
                              ing.amount_unit,
                              unitsPreference
                            ) ?? ''}
                          </Text>
                        )}
                      </View>
                      {onEditIngredient && (
                        <Pressable onPress={() => onEditIngredient(ing.id)} style={styles.editBtn}>
                          <Text style={styles.editBtnText}>✎</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.tabListContent}
                />
              )}
            </View>
          )}

          <Pressable
            style={[styles.tabHeader, openSection === 'timeline' && styles.tabHeaderActive]}
            onPress={() => setOpenSection('timeline')}
          >
            <Text style={[styles.tabHeaderText, openSection === 'timeline' && styles.tabHeaderTextActive]}>
              Timeline
            </Text>
          </Pressable>
          {openSection === 'timeline' && (
            <View style={styles.tabContentFrame}>
              {steps.length === 0 ? (
                <Text style={styles.empty}>No steps</Text>
              ) : (
                <FlatList
                  style={styles.tabList}
                  data={steps}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.stepCard}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepHeaderLeft}>
                          <Text style={styles.stepDate}>
                            {formatDateMMDDYYYY(item.occurred_at)}
                          </Text>
                          {item.gravity != null && (
                            <Text style={styles.stepGravity}>SG: {item.gravity}</Text>
                          )}
                        </View>
                        {onEditStep && (
                          <Pressable onPress={() => onEditStep(item.id)} style={styles.editBtn}>
                            <Text style={styles.editBtnText}>✎</Text>
                          </Pressable>
                        )}
                      </View>
                      {item.title && <Text style={styles.stepTitle}>{item.title}</Text>}
                      <Text style={styles.stepNotes}>{item.notes}</Text>
                    </View>
                  )}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.tabListContent}
                />
              )}
            </View>
          )}
        </View>

        <View style={[styles.actionsDock, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => onAddStep(batchId)}>
              <Text style={styles.actionBtnText}>Add Step</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => onAddIngredient(batchId)}>
              <Text style={styles.actionBtnText}>Add Ingredient</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => onAddReminder(batchId, batch.name)}>
              <Text style={styles.actionBtnText}>Add Reminder</Text>
            </Pressable>
          </View>
        </View>
      </View>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function shouldShowReminderTime(reminder: Reminder): boolean {
  return reminder.template_key.includes('HOURS');
}

function formatReminderText(reminder: Reminder): string {
  const dateText = formatDateMMDDYYYY(reminder.scheduled_for);
  if (!shouldShowReminderTime(reminder)) {
    return `${reminder.title} on ${dateText}`;
  }
  return `${reminder.title} on ${dateText} at ${formatTime(reminder.scheduled_for)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.border,
  },
  remindersSection: {
    marginBottom: 10,
  },
  remindersScroll: {
    maxHeight: 132,
  },
  reminderSwipeAction: {
    width: 92,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A5A16',
  },
  reminderSwipeActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  headerContent: {
    gap: 10,
  },
  sectionsArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tabHeader: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    backgroundColor: lightTheme.surface,
  },
  tabHeaderActive: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  tabHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: lightTheme.text,
  },
  tabHeaderTextActive: {
    color: '#fff',
  },
  tabContentFrame: {
    flex: 1,
    minHeight: 220,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    backgroundColor: lightTheme.surface,
    padding: 10,
  },
  tabList: {
    flex: 1,
  },
  tabListContent: {
    paddingBottom: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: lightTheme.primary,
  },
  meta: {
    fontSize: 14,
    color: lightTheme.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineEditableText: {
    color: lightTheme.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  inlineInput: {
    minWidth: 110,
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: lightTheme.text,
    fontSize: 14,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
    backgroundColor: lightTheme.surface,
  },
  statusChipSelected: {
    borderColor: lightTheme.primary,
    backgroundColor: lightTheme.primary,
  },
  statusChipText: {
    fontSize: 11,
    color: lightTheme.text,
  },
  statusChipTextSelected: {
    color: '#fff',
  },
  abvRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  abv: {
    fontSize: 12,
    color: lightTheme.accent,
  },
  goalAbv: {
    fontSize: 12,
    color: '#B22020',
    fontWeight: '700',
  },
  reminderBanner: {
    marginBottom: 8,
    width: '100%',
    backgroundColor: '#D4A843',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reminderBannerText: {
    textAlign: 'center',
    color: '#B22020',
    fontWeight: '700',
    flex: 1,
  },
  reminderBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBell: {
    marginHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.primary,
  },
  empty: {
    color: lightTheme.muted,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.border,
  },
  ingredientName: {
    fontSize: 14,
    color: lightTheme.text,
  },
  ingredientAmount: {
    fontSize: 14,
    color: lightTheme.muted,
  },
  stepCard: {
    backgroundColor: lightTheme.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    padding: 4,
  },
  editBtnText: {
    fontSize: 16,
    color: lightTheme.primary,
  },
  stepDate: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTheme.text,
  },
  stepGravity: {
    fontSize: 12,
    color: lightTheme.accent,
  },
  stepTitle: {
    fontSize: 14,
    color: lightTheme.text,
    marginTop: 4,
  },
  stepNotes: {
    fontSize: 14,
    color: lightTheme.muted,
    marginTop: 4,
  },
  actionsDock: {
    borderTopWidth: 1,
    borderTopColor: lightTheme.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: lightTheme.background,
  },
  actions: {
    gap: 8,
  },
  actionBtn: {
    backgroundColor: lightTheme.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
