import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Értesítés gomb kezelése
Notifications.addNotificationResponseReceivedListener(response => {
  const actionId = response.actionIdentifier;
  const packageName = response.notification.request.content.data?.packageName as string;

  if (actionId === 'STOP' && packageName) {
    // Megnyitja a parkoló appot
    Linking.openURL(`intent://#Intent;package=${packageName};scheme=parki;end`).catch(() => {
      Linking.openURL(`market://details?id=${packageName}`);
    });
  }
  // 'RENDBEN' esetén nem csinálunk semmit - szándékos elmenetel
});

export async function initNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    // Értesítési kategória a gombokkal
    await Notifications.setNotificationCategoryAsync('PARKING', [
      {
        identifier: 'STOP',
        buttonTitle: '🅿️ Stop',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'RENDBEN',
        buttonTitle: '✓ Rendben',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationChannelAsync('parki_reminder', {
      name: 'Parkolás emlékeztető',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#00E5A0',
      sound: 'default',
    });
  }
}

export async function sendParkingReminder(appName: string, packageName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🅿️ Folyamatban lévő parkolás!',
      body: `${appName} – Ne felejtse el leállítani!`,
      sound: 'default',
      categoryIdentifier: 'PARKING',
      data: { packageName },
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#00E5A0',
    },
    trigger: null,
  });
}

export async function getWatchedApps(): Promise<string[]> {
  const raw = await AsyncStorage.getItem('watchedApps');
  if (!raw) return defaultPackages;
  return JSON.parse(raw);
}

export async function saveWatchedApps(packages: string[]) {
  await AsyncStorage.setItem('watchedApps', JSON.stringify(packages));
}

export const defaultPackages = [
  'hu.parkl.android',
  'com.easypark.android',
  'com.parkmobile.android',
  'com.flowbird.android',
  'hu.mol.move',
  'com.mypermit.android',
  'com.vodafone.easyrider',
];

export const knownParkingApps = [
  { package: 'hu.parkl.android', name: 'Parkl' },
  { package: 'com.easypark.android', name: 'EasyPark' },
  { package: 'com.parkmobile.android', name: 'ParkMobile' },
  { package: 'com.flowbird.android', name: 'Flowbird' },
  { package: 'hu.mol.move', name: 'MOL Move' },
  { package: 'com.mypermit.android', name: 'MyPermit' },
  { package: 'com.vodafone.easyrider', name: 'One Easy Rider' },
];
