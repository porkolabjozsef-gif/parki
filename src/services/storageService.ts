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
  { packageName: 'net.parkl.androidclient', displayName: 'Parkl', enabled: true },
  { packageName: 'net.easypark.android', displayName: 'EasyPark', enabled: true },
  { packageName: 'com.parkmobile.android', displayName: 'ParkMobile', enabled: true },
  { packageName: 'com.flowbird.android', displayName: 'Flowbird', enabled: true },
  { packageName: 'hu.mol.move', displayName: 'MOL Move', enabled: true },
  { packageName: 'com.mypermit.android', displayName: 'MyPermit', enabled: true },
  { packageName: 'com.vodafone.easyrider', displayName: 'One Easy Rider', enabled: true },
  { packageName: 'com.otpmobil.simple.phoenix', displayName: 'Simple', enabled: true },
  { packageName: 'telekom.hu.android.mobilvasarlas', displayName: 'Telekom', enabled: true },
  { packageName: 'hu.parkinghungary.app', displayName: 'Parking Hungary', enabled: true },
];

const KEY = 'parki_state';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    isMonitoring: true,
    delaySeconds: 30,
    watchedApps: DEFAULT_APPS,
  };
}

export async function saveState(state: AppState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
