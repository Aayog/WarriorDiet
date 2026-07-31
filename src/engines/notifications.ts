import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/** Cancel everything and schedule fresh end alerts from targetEndAt. */
export async function rescheduleNotifications(targetEndAt: number): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const thirtyMinBefore = targetEndAt - 30 * 60 * 1000;

  if (thirtyMinBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Almost done',
        body: 'Fast ends in 30 minutes.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(thirtyMinBefore),
      },
    });
  }

  if (targetEndAt > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Fast complete!',
        body: 'Time to eat.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(targetEndAt),
      },
    });
  }
}

export async function clearNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
