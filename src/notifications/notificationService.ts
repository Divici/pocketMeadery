import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function scheduleReminderNotification(
  reminderId: string,
  batchId: string,
  title: string,
  body: string | null,
  scheduledFor: number
): Promise<string | null> {
  const permission = await getNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Mead Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const now = Date.now();
  const trigger =
    scheduledFor <= now + 60 * 1000
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledFor,
        };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: body ?? '',
      data: { batchId, reminderId },
    },
    trigger,
  });

  return identifier;
}

export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
