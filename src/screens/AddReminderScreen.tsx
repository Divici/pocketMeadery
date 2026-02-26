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
import { createReminder } from '../db/repositories';
import {
  REMINDER_TEMPLATES,
  getScheduledForFromRelative,
  type ReminderTemplateKey,
} from '../notifications/reminderTemplates';
import {
  scheduleReminderNotification,
  requestNotificationPermission,
} from '../notifications/notificationService';
import { lightTheme } from '../theme';
import { parseDateMMDDYYYY } from '../lib/date';

type Props = {
  batchId: string;
  batchName?: string;
  onSaved: () => void;
  onCancel: () => void;
};

const TEMPLATE_KEYS = Object.keys(REMINDER_TEMPLATES) as ReminderTemplateKey[];

export function AddReminderScreen({
  batchId,
  batchName,
  onSaved,
  onCancel,
}: Props) {
  const { db } = useDatabase();
  const [templateKey, setTemplateKey] = useState<ReminderTemplateKey>('RACK_IN_DAYS');
  const [value, setValue] = useState('7');
  const [customTitle, setCustomTitle] = useState('');
  const [customUnit, setCustomUnit] = useState<'hours' | 'days'>('days');
  const [useSpecificDate, setUseSpecificDate] = useState(false);
  const [specificDateInput, setSpecificDateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const template = REMINDER_TEMPLATES[templateKey];

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);
    setError(null);
    setPermissionDenied(false);

    let scheduledFor: number;
    let title: string;

    if (useSpecificDate && specificDateInput.trim()) {
      const parsed = parseDateMMDDYYYY(specificDateInput.trim());
      if (!parsed) {
        setError('Invalid date. Use MM/DD/YYYY format.');
        setSaving(false);
        return;
      }
      scheduledFor = parsed;
      title = templateKey === 'OTHER' ? customTitle.trim() : template.defaultTitle;
    } else {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        setError('Enter a valid number');
        setSaving(false);
        return;
      }
      if (templateKey === 'OTHER') {
        const now = Date.now();
        scheduledFor =
          customUnit === 'hours'
            ? now + num * 60 * 60 * 1000
            : now + num * 24 * 60 * 60 * 1000;
      } else {
        scheduledFor = getScheduledForFromRelative(templateKey, num);
      }
      title = templateKey === 'OTHER' ? customTitle.trim() : template.defaultTitle;
    }

    if (!title) {
      setError('Please provide a reminder title');
      setSaving(false);
      return;
    }

    if (scheduledFor <= Date.now()) {
      setError('Schedule for a future date/time');
      setSaving(false);
      return;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        setPermissionDenied(true);
      }

      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: templateKey,
        title,
        body: batchName ? `Batch: ${batchName}` : undefined,
        scheduled_for: scheduledFor,
        notification_id: null,
      });

      let notificationId: string | null = null;
      if (permission === 'granted') {
        notificationId = await scheduleReminderNotification(
          reminder.id,
          batchId,
          title,
          batchName ? `Batch: ${batchName}` : null,
          scheduledFor
        );
        if (notificationId) {
          const { updateReminder } = require('../db/repositories/reminderRepository');
          await updateReminder(db, reminder.id, { notification_id: notificationId });
        }
      }

      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Reminder</Text>

      <Text style={styles.label}>Template</Text>
      <View style={styles.chipRow}>
        {TEMPLATE_KEYS.map((key) => {
          const t = REMINDER_TEMPLATES[key];
          return (
            <Pressable
              key={key}
              style={[
                styles.chip,
                templateKey === key && styles.chipSelected,
              ]}
              onPress={() => setTemplateKey(key)}
            >
              <Text
                style={[
                  styles.chipText,
                  templateKey === key && styles.chipTextSelected,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {templateKey === 'OTHER' && (
        <>
          <Text style={styles.label}>Custom Reminder Text</Text>
          <TextInput
            style={styles.input}
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="e.g. Check airlock"
            placeholderTextColor={lightTheme.muted}
          />
        </>
      )}

      {!useSpecificDate && (
        <>
          <Text style={styles.label}>
            {(templateKey === 'OTHER' ? customUnit : template.unit) === 'days'
              ? 'Days from now'
              : 'Hours from now'}
          </Text>
          {templateKey === 'OTHER' && (
            <View style={styles.unitChipRow}>
              <Pressable
                style={[
                  styles.unitChip,
                  customUnit === 'hours' && styles.unitChipSelected,
                ]}
                onPress={() => setCustomUnit('hours')}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    customUnit === 'hours' && styles.unitChipTextSelected,
                  ]}
                >
                  Hours
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.unitChip,
                  customUnit === 'days' && styles.unitChipSelected,
                ]}
                onPress={() => setCustomUnit('days')}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    customUnit === 'days' && styles.unitChipTextSelected,
                  ]}
                >
                  Days
                </Text>
              </Pressable>
            </View>
          )}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={
              (templateKey === 'OTHER' ? customUnit : template.unit) === 'days'
                ? 'e.g. 7'
                : 'e.g. 24'
            }
            keyboardType="number-pad"
            placeholderTextColor={lightTheme.muted}
          />
        </>
      )}

      <Pressable
        style={styles.toggle}
        onPress={() => setUseSpecificDate(!useSpecificDate)}
      >
        <Text style={styles.toggleText}>
          {useSpecificDate ? 'Use relative (X days/hours)' : 'Use specific date'}
        </Text>
      </Pressable>

      {useSpecificDate && (
        <>
          <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
          <TextInput
            style={styles.input}
            value={specificDateInput}
            onChangeText={setSpecificDateInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={lightTheme.muted}
          />
        </>
      )}

      {permissionDenied && (
        <Text style={styles.warning}>
          Notifications disabled. Reminder saved but won't fire.
        </Text>
      )}
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
  unitChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  unitChipSelected: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  unitChipText: {
    color: lightTheme.text,
  },
  unitChipTextSelected: {
    color: '#fff',
  },
  toggle: {
    marginBottom: 16,
  },
  toggleText: {
    color: lightTheme.primary,
    fontSize: 14,
  },
  warning: {
    color: lightTheme.accent,
    marginBottom: 16,
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
