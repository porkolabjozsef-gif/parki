import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { t } from './i18nService';
import * as IntentLauncher from 'expo-intent-launcher';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Parkolás-kulcsszavak több nyelven (keywordFilter-es appokhoz)
export const PARKING_KEYWORDS = [
  'parkol', 'parkolás', 'parkolas', 'parking', 'park',
  'zóna', 'zona', 'zone', 'rendszám', 'rendszam', 'plate',
  'mobilparkolás', 'mobilparkolas', 'díjfizetés', 'dijfizetes',
  'stop', 'leállít', 'leallit', 'elindítva', 'elinditva',
];

/**
 * Eldönti, hogy egy adott értesítésre riasszunk-e.
 * - keywordFilter nélküli app: minden értesítésére riaszt
 * - keywordFilter-es app (pl. Yettel): csak ha a szöveg parkolás-kulcsszót tartalmaz
 */
export function shouldAlert(keywordFilter: boolean | undefined, title?: string, body?: string): boolean {
  if (!keywordFilter) return true;
  const text = `${title || ''} ${body || ''}`.toLowerCase();
  return PARKING_KEYWORDS.some(kw => text.includes(kw));
}

// Parkoló alkalmazás megnyitása csomagnév alapján (natív intent)
export async function openParkingApp(packageName: string) {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      packageName: packageName,
      category: 'android.intent.category.LAUNCHER',
    });
    return;
  } catch (_) {}
  // Fallback: Play Áruház
  Linking.openURL(`market://details?id=${packageName}`).catch(() => {});
}`).catch(() => {});
}

// Értesítés gomb / kattintás kezelése
Notifications.addNotificationResponseReceivedListener(response => {
  const actionId = response.actionIdentifier;
  const packageName = response.notification.request.content.data?.packageName as string;

  // STOP gomb VAGY az értesítésre kattintás (DEFAULT) → app megnyitása + parkolás leállítása
  const isStop = actionId === 'STOP';
  const isDefault = actionId === Notifications.DEFAULT_ACTION_IDENTIFIER;

  if ((isStop || isDefault) && packageName) {
    import('./monitorService').then(m => m.clearActiveParking());
    openParkingApp(packageName);
  } else if (actionId === 'OK') {
    // Szándékos elmenetel - ne riasszon újra, amíg vissza nem tér
    import('./monitorService').then(m => m.markIntentionalLeave());
  }
});

export async function initNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationCategoryAsync('PARKING', [
      {
        identifier: 'STOP',
        buttonTitle: t('notifStop'),
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'OK',
        buttonTitle: t('notifOk'),
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationChannelAsync('parki_reminder', {
      name: 'Parki',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#00E5A0',
      sound: 'default',
    });
  }

  return finalStatus;
}

export async function sendParkingReminder(appName: string, packageName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifTitle'),
      body: t('notifBody', { app: appName }),
      sound: 'default',
      categoryIdentifier: 'PARKING',
      data: { packageName },
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#00E5A0',
    },
    trigger: null,
  });
}
