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
import { listCompletedBatches } from '../db/repositories';
import { lightTheme } from '../theme';
import type { Batch } from '../db/types';

type Props = {
  onBatchPress: (batchId: string) => void;
};

export function CompletedScreen({ onBatchPress }: Props) {
  const { db } = useDatabase();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db) return;
    const b = await listCompletedBatches(db);
    setBatches(b);
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
      <Text style={styles.title}>Completed Batches</Text>
      {batches.length === 0 ? (
        <Text style={styles.empty}>No completed batches</Text>
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
                {item.status} • {formatDate(item.updated_at)}
              </Text>
            </Pressable>
          )}
        />
      )}
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: lightTheme.primary,
    marginBottom: 16,
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
});
