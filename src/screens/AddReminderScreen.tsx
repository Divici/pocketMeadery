import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
      title = template.defaultTitle;
    } else {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        setError('Enter a valid number');
        setSaving(false);
        return;
      }
      scheduledFor = getScheduledForFromRelative(templateKey, num);
      title = template.defaultTitle;
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
    <View style={styles.container}>
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

      {!useSpecificDate && (
        <>
          <Text style={styles.label}>
            {template.unit === 'days' ? 'Days from now' : 'Hours from now'}
          </Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={template.unit === 'days' ? 'e.g. 7' : 'e.g. 24'}
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
