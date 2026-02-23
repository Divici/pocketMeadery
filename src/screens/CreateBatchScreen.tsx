import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import { createBatch } from '../db/repositories';
import { lightTheme } from '../theme';
import type { BatchStatus } from '../db/types';

const STATUSES: BatchStatus[] = [
  'ACTIVE_PRIMARY',
  'SECONDARY',
  'AGING',
  'BOTTLED',
  'ARCHIVED',
];

type Props = {
  onCreated: (batchId: string) => void;
  onCancel: () => void;
};

export function CreateBatchScreen({ onCreated, onCancel }: Props) {
  const { db } = useDatabase();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<BatchStatus>('ACTIVE_PRIMARY');
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('');
  const [goalAbv, setGoalAbv] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!db) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const batch = await createBatch(db, {
        name: trimmed,
        status,
        batch_volume_value: volumeValue ? parseFloat(volumeValue) : undefined,
        batch_volume_unit: volumeUnit || undefined,
        goal_abv: goalAbv ? parseFloat(goalAbv) : undefined,
      });
      onCreated(batch.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Batch</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Batch name"
        placeholderTextColor={lightTheme.muted}
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[styles.statusChip, status === s && styles.statusChipSelected]}
            onPress={() => setStatus(s)}
          >
            <Text
              style={[
                styles.statusChipText,
                status === s && styles.statusChipTextSelected,
              ]}
            >
              {s.replace('_', ' ')}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Volume (optional)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={volumeValue}
          onChangeText={setVolumeValue}
          placeholder="Value"
          keyboardType="decimal-pad"
          placeholderTextColor={lightTheme.muted}
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={volumeUnit}
          onChangeText={setVolumeUnit}
          placeholder="gal / L"
          placeholderTextColor={lightTheme.muted}
        />
      </View>

      <Text style={styles.label}>Goal ABV % (optional)</Text>
      <TextInput
        style={styles.input}
        value={goalAbv}
        onChangeText={setGoalAbv}
        placeholder="e.g. 14"
        keyboardType="decimal-pad"
        placeholderTextColor={lightTheme.muted}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? 'Creating...' : 'Create'}
          </Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={onCancel}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: lightTheme.primary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: lightTheme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: lightTheme.text,
    marginBottom: 16,
  },
  inputSmall: {
    flex: 1,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  statusChipSelected: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  statusChipText: {
    fontSize: 12,
    color: lightTheme.text,
  },
  statusChipTextSelected: {
    color: '#fff',
  },
  error: {
    color: '#c00',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
  btn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: lightTheme.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondaryText: {
    color: lightTheme.primary,
    fontSize: 16,
  },
});
