import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import { createStep } from '../db/repositories';
import { recalculateBatchABV } from '../services/batchAbvService';
import { lightTheme } from '../theme';
import { formatDateMMDDYYYY, parseDateMMDDYYYY } from '../lib/date';

type Props = {
  batchId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function AddStepScreen({ batchId, onSaved, onCancel }: Props) {
  const { db } = useDatabase();
  const [occurredAt, setOccurredAt] = useState(() => Date.now());
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [gravity, setGravity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!db) return;
    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      setError('Notes are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createStep(db, {
        batch_id: batchId,
        occurred_at: occurredAt,
        title: title.trim() || undefined,
        notes: trimmedNotes,
        gravity: gravity ? parseFloat(gravity) : undefined,
      });
      await recalculateBatchABV(db, batchId);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add step');
    } finally {
      setSaving(false);
    }
  };

  const [dateInput, setDateInput] = useState(() => formatDateMMDDYYYY(occurredAt));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Step</Text>

      <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
      <TextInput
        style={styles.input}
        value={dateInput}
        onChangeText={(v) => {
          setDateInput(v);
          const parsed = parseDateMMDDYYYY(v);
          if (parsed != null) setOccurredAt(parsed);
        }}
        placeholder="MM/DD/YYYY"
        placeholderTextColor={lightTheme.muted}
      />

      <Text style={styles.label}>Title (optional)</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Racked to secondary"
        placeholderTextColor={lightTheme.muted}
      />

      <Text style={styles.label}>Notes *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="What happened"
        placeholderTextColor={lightTheme.muted}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Gravity (optional)</Text>
      <TextInput
        style={styles.input}
        value={gravity}
        onChangeText={setGravity}
        placeholder="e.g. 1.050"
        keyboardType="decimal-pad"
        placeholderTextColor={lightTheme.muted}
      />

      {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.btnPrimaryText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={onCancel}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  textArea: {
    minHeight: 100,
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
