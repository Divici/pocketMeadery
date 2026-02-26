import { useEffect, useState } from 'react';
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
import {
  getIngredientById,
  updateIngredient,
} from '../db/repositories';
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
  ingredientId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function EditIngredientScreen({
  ingredientId,
  onSaved,
  onCancel,
}: Props) {
  const { db } = useDatabase();
  const [name, setName] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [amountUnit, setAmountUnit] = useState('');
  const [showUnitOptions, setShowUnitOptions] = useState(false);
  const [ingredientType, setIngredientType] = useState<IngredientType | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    getIngredientById(db, ingredientId).then((ingredient) => {
      if (ingredient) {
        setName(ingredient.name);
        setAmountValue(
          ingredient.amount_value != null ? String(ingredient.amount_value) : ''
        );
        setAmountUnit(ingredient.amount_unit ?? '');
        setIngredientType(ingredient.ingredient_type ?? null);
        setNotes(ingredient.notes ?? '');
      }
      setLoading(false);
    });
  }, [db, ingredientId]);

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
      await updateIngredient(db, ingredientId, {
        name: trimmed,
        amount_value: amountValue ? parseFloat(amountValue) : null,
        amount_unit: amountUnit || null,
        ingredient_type: ingredientType,
        notes: notes.trim() || null,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update ingredient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Ingredient</Text>

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
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={amountValue}
          onChangeText={setAmountValue}
          placeholder="Value"
          keyboardType="decimal-pad"
          placeholderTextColor={lightTheme.muted}
        />
        <View style={styles.inputSmall}>
          <Pressable
            style={[styles.input, styles.unitSelectBox]}
            onPress={() => setShowUnitOptions((v) => !v)}
          >
            <Text style={styles.unitSelectText}>{amountUnit || 'Select unit'}</Text>
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

      <Text style={styles.label}>Type (optional)</Text>
      <View style={styles.chipRow}>
        {INGREDIENT_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[styles.chip, ingredientType === t && styles.chipSelected]}
            onPress={() => setIngredientType(ingredientType === t ? null : t)}
          >
            <Text
              style={[
                styles.chipText,
                ingredientType === t && styles.chipTextSelected,
              ]}
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
  inputSmall: {
    flex: 1,
    marginBottom: 0,
  },
  unitSelectBox: {
    justifyContent: 'center',
  },
  unitSelectText: {
    color: lightTheme.text,
    fontSize: 16,
  },
  unitOptions: {
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 8,
    overflow: 'hidden',
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
