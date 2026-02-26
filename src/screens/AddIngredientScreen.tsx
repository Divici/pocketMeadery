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
import { createIngredient } from '../db/repositories';
import { lightTheme } from '../theme';
import type { IngredientType } from '../db/types';

const INGREDIENT_TYPES: IngredientType[] = [
  'HONEY',
  'YEAST',
  'NUTRIENT',
  'FRUIT',
  'ADDITION',
  'OTHER',
];
const AMOUNT_UNITS = ['', 'lb', 'kg', 'oz', 'g', 'gal', 'L'];

type Props = {
  batchId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function AddIngredientScreen({ batchId, onSaved, onCancel }: Props) {
  const { db } = useDatabase();
  const [name, setName] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [amountUnit, setAmountUnit] = useState('');
  const [showUnitOptions, setShowUnitOptions] = useState(false);
  const [ingredientType, setIngredientType] = useState<IngredientType | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unitLabel = amountUnit && amountUnit.trim().length > 0 ? amountUnit : 'Select unit';

  const handleSave = async () => {
    if (!db) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createIngredient(db, {
        batch_id: batchId,
        name: trimmed,
        amount_value: amountValue ? parseFloat(amountValue) : undefined,
        amount_unit: amountUnit || undefined,
        ingredient_type: ingredientType ?? undefined,
        notes: notes.trim() || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add ingredient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowUnitOptions(false);
      }}
      accessible={false}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Ingredient</Text>

          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Wildflower Honey"
            placeholderTextColor={lightTheme.muted}
          />

          <Text style={styles.label}>Amount (optional)</Text>
          <View style={styles.row}>
            <View style={styles.amountColumn}>
              <Text style={styles.subLabel}>Value</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amountValue}
                onChangeText={setAmountValue}
                placeholder="Value"
                keyboardType="decimal-pad"
                placeholderTextColor={lightTheme.muted}
              />
            </View>
            <View style={styles.amountColumn}>
              <Text style={styles.subLabel}>Unit</Text>
              <View style={styles.unitContainer}>
                <Pressable
                  style={[styles.input, styles.amountInput, styles.unitSelectBox]}
                  onPress={() => setShowUnitOptions((v) => !v)}
                >
                  <Text
                    style={[
                      styles.unitSelectText,
                      unitLabel === 'Select unit' && styles.unitSelectPlaceholder,
                    ]}
                  >
                    {unitLabel}
                  </Text>
                </Pressable>
                {showUnitOptions && (
                  <View style={styles.unitOptions}>
                    {AMOUNT_UNITS.filter(Boolean).map((u) => (
                      <Pressable
                        key={u}
                        style={styles.unitOption}
                        onPress={() => {
                          setAmountUnit(u);
                          setShowUnitOptions(false);
                        }}
                      >
                        <Text style={styles.unitOptionText}>{u}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Type (optional)</Text>
          <View style={styles.chipRow}>
            {INGREDIENT_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.chip, ingredientType === t && styles.chipSelected]}
                onPress={() => setIngredientType(ingredientType === t ? null : t)}
              >
                <Text
                  style={[styles.chipText, ingredientType === t && styles.chipTextSelected]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            placeholderTextColor={lightTheme.muted}
            multiline
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.btnPrimaryText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    zIndex: 10,
  },
  amountColumn: {
    flex: 1,
  },
  subLabel: {
    fontSize: 12,
    color: lightTheme.muted,
    marginBottom: 6,
  },
  amountInput: {
    height: 46,
    marginBottom: 0,
    paddingVertical: 10,
  },
  unitContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 20,
  },
  unitSelectBox: {
    justifyContent: 'center',
  },
  unitSelectText: {
    color: lightTheme.text,
    fontSize: 16,
  },
  unitSelectPlaceholder: {
    color: lightTheme.muted,
  },
  unitOptions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 30,
    elevation: 6,
  },
  unitOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.border,
  },
  unitOptionText: {
    color: lightTheme.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  chipSelected: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  chipText: {
    fontSize: 12,
    color: lightTheme.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
  textArea: {
    minHeight: 80,
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
