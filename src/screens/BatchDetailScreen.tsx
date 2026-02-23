import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  getBatchById,
  listStepsByBatch,
  listIngredientsByBatch,
} from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch, Step, Ingredient } from '../db/types';

type Props = {
  batchId: string;
  onAddStep: (batchId: string) => void;
  onAddIngredient: (batchId: string) => void;
  onAddReminder: (batchId: string, batchName?: string) => void;
  onEditStep?: (stepId: string) => void;
  onFocus?: () => void;
};

export function BatchDetailScreen({
  batchId,
  onAddStep,
  onAddIngredient,
  onAddReminder,
  onEditStep,
}: Props) {
  const { db } = useDatabase();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db) return;
    const [b, s, i] = await Promise.all([
      getBatchById(db, batchId),
      listStepsByBatch(db, batchId),
      listIngredientsByBatch(db, batchId),
    ]);
    setBatch(b ?? null);
    setSteps(s);
    setIngredients(i);
    setLoading(false);
  }, [db, batchId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
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
        <Text style={styles.name}>{batch.name}</Text>
        <Text style={styles.meta}>
          {batch.status} • Created {formatDate(batch.created_at)}
        </Text>
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
      </View>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.length === 0 ? (
        <Text style={styles.empty}>No ingredients</Text>
      ) : (
        ingredients.map((ing) => (
          <View key={ing.id} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{ing.name}</Text>
            {ing.amount_value != null && (
              <Text style={styles.ingredientAmount}>
                {ing.amount_value} {ing.amount_unit ?? ''}
              </Text>
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
                  <Text style={styles.stepDate}>{formatDate(item.occurred_at)}</Text>
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

function formatDate(ms: number): string {
  const d = new Date(ms);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return `${m.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${y}`;
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
  abvRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  abv: {
    fontSize: 12,
    color: lightTheme.accent,
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
