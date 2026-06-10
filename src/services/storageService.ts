import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchedApp {
  packageName: string;
  displayName: string;
  enabled: boolean;
}

export interface AppState {
  isMonitoring: boolean;
  delaySeconds: number;
  watchedApps: WatchedApp[];
}

const DEFAULT_APPS: WatchedApp[] = [
  { packageName: 'hu.parkl.android', displayName: 'Parkl', enabled: true },
  { packageName: 'com.easypark.android', displayName: 'EasyPark', enabled: true },
  { packageName: 'com.parkmobile.android', displayName: 'ParkMobile', enabled: true },
  { packageName: 'com.flowbird.android', displayName: 'Flowbird', enabled: true },
  { packageName: 'hu.mol.move', displayName: 'MOL Move', enabled: true },
  { packageName: 'com.mypermit.android', displayName: 'MyPermit', enabled: true },
  { packageName: 'com.vodafone.easyrider', displayName: 'One Easy Rider', enabled: true },
];

const KEY = 'parki_state';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    isMonitoring: false,
    delaySeconds: 30,
    watchedApps: DEFAULT_APPS,
  };
}

export async function saveState(state: AppState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
