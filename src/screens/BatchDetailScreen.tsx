import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import {
  getBatchById,
  listStepsByBatch,
  listIngredientsByBatch,
  getSetting,
  listUpcomingRemindersByBatch,
  updateBatch,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch, Step, Ingredient, BatchStatus, Reminder } from '../db/types';
import type { UnitsPreference } from '../lib/units';
import { formatAmountForDisplay } from '../lib/units';
import { formatDateMMDDYYYY, parseDateMMDDYYYY } from '../lib/date';

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
  const [batch, setBatch] = useState<Batch | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unitsPreference, setUnitsPreference] = useState<UnitsPreference>('US');
  const [createdDateInput, setCreatedDateInput] = useState('');
  const [goalAbvInput, setGoalAbvInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db) return;
    const [b, s, i, r, units] = await Promise.all([
      getBatchById(db, batchId),
      listStepsByBatch(db, batchId),
      listIngredientsByBatch(db, batchId),
      listUpcomingRemindersByBatch(db, batchId, 3),
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

  const handleStatusUpdate = useCallback(
    async (status: BatchStatus) => {
      if (!db || !batch || batch.status === status) return;
      await updateBatch(db, batch.id, { status });
      await load();
    },
    [db, batch, load]
  );

  const getStatusLabel = (status: BatchStatus) => {
    if (status === 'ACTIVE_PRIMARY') return 'Active';
    return status.replace('_', ' ');
  };

  const handleHeaderSave = useCallback(async () => {
    if (!db || !batch) return;
    const created = parseDateMMDDYYYY(createdDateInput.trim());
    if (created == null) return;
    const parsedGoal = goalAbvInput.trim();
    await updateBatch(db, batch.id, {
      created_at: created,
      goal_abv: parsedGoal ? parseFloat(parsedGoal) : null,
    });
    await load();
  }, [db, batch, createdDateInput, goalAbvInput, load]);

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
        <Text style={styles.name}>{batch.name}</Text>
        <Text style={styles.meta}>
          {getStatusLabel(batch.status)} • Created {formatDateMMDDYYYY(batch.created_at)}
        </Text>
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
                {status.replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.abvRow}>
          {batch.goal_abv != null && (
            <Text style={styles.abv}>Goal: {batch.goal_abv}%</Text>
          )}
          {batch.expected_abv != null && (
            <Text style={styles.abv}>Expected: {batch.expected_abv.toFixed(1)}%</Text>
          )}
          {batch.current_abv != null && (
            <Text style={styles.abv}>Current: {batch.current_abv.toFixed(1)}%</Text>
          )}
          {batch.goal_abv == null &&
            batch.expected_abv == null &&
            batch.current_abv == null && (
              <Text style={styles.abv}>ABV: —</Text>
            )}
        </View>
        {reminders.length > 0 && (
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderBannerText}>{reminders[0].title}</Text>
          </View>
        )}
        <View style={styles.headerEditor}>
          <Text style={styles.headerEditorLabel}>Created Date (MM/DD/YYYY)</Text>
          <TextInput
            style={styles.headerEditorInput}
            value={createdDateInput}
            onChangeText={setCreatedDateInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={lightTheme.muted}
          />
          <Text style={styles.headerEditorLabel}>Goal ABV</Text>
          <TextInput
            style={styles.headerEditorInput}
            value={goalAbvInput}
            onChangeText={setGoalAbvInput}
            placeholder="e.g. 14"
            placeholderTextColor={lightTheme.muted}
            keyboardType="decimal-pad"
          />
          <Pressable style={styles.saveHeaderBtn} onPress={handleHeaderSave}>
            <Text style={styles.saveHeaderBtnText}>Save Header Changes</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.length === 0 ? (
        <Text style={styles.empty}>No ingredients</Text>
      ) : (
        ingredients.map((ing) => (
          <View key={ing.id} style={styles.ingredientRow}>
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
              <Pressable
                onPress={() => onEditIngredient(ing.id)}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>✎</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Timeline</Text>
      {steps.length === 0 ? (
        <Text style={styles.empty}>No steps</Text>
      ) : (
        <FlatList
          data={steps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepHeaderLeft}>
                  <Text style={styles.stepDate}>{formatDateMMDDYYYY(item.occurred_at)}</Text>
                  {item.gravity != null && (
                    <Text style={styles.stepGravity}>SG: {item.gravity}</Text>
                  )}
                </View>
                {onEditStep && (
                  <Pressable
                    onPress={() => onEditStep(item.id)}
                    style={styles.editBtn}
                  >
                    <Text style={styles.editBtnText}>✎</Text>
                  </Pressable>
                )}
              </View>
              {item.title && (
                <Text style={styles.stepTitle}>{item.title}</Text>
              )}
              <Text style={styles.stepNotes}>{item.notes}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => onAddStep(batchId)}>
          <Text style={styles.actionBtnText}>Add Step</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAddIngredient(batchId)}
        >
          <Text style={styles.actionBtnText}>Add Ingredient</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAddReminder(batchId, batch.name)}
        >
          <Text style={styles.actionBtnText}>Add Reminder</Text>
        </Pressable>
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
  header: {
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: lightTheme.primary,
  },
  meta: {
    fontSize: 14,
    color: lightTheme.muted,
    marginTop: 4,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
    marginTop: 8,
  },
  abv: {
    fontSize: 12,
    color: lightTheme.accent,
  },
  reminderBanner: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#D4A843',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reminderBannerText: {
    textAlign: 'center',
    color: '#111',
    fontWeight: '700',
  },
  headerEditor: {
    marginTop: 12,
    gap: 6,
  },
  headerEditorLabel: {
    fontSize: 12,
    color: lightTheme.muted,
  },
  headerEditorInput: {
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: lightTheme.text,
  },
  saveHeaderBtn: {
    marginTop: 8,
    backgroundColor: lightTheme.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveHeaderBtnText: {
    color: '#fff',
    fontWeight: '600',
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
  actions: {
    gap: 8,
    marginTop: 24,
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
