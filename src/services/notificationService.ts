import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('parki_reminder', {
      name: 'Parkolás emlékeztető',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#00E5A0',
      sound: 'default',
    });
  }
}

export async function sendParkingReminder(appName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🅿️ Parkolás aktív!',
      body: `${appName} – Ne felejtse el leállítani a parkolást!`,
      sound: 'default',
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
];

export const knownParkingApps = [
  { package: 'hu.parkl.android', name: 'Parkl' },
  { package: 'com.easypark.android', name: 'EasyPark' },
  { package: 'com.parkmobile.android', name: 'ParkMobile' },
  { package: 'com.flowbird.android', name: 'Flowbird' },
  { package: 'hu.mol.move', name: 'MOL Move' },
  { package: 'com.mypermit.android', name: 'MyPermit' },
];
