import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchedApp {
  packageName: string;
  displayName: string;
  enabled: boolean;
  iconUrl?: string;
  // Ha true: csak parkolás-kulcsszót tartalmazó értesítésre riaszt (általános appoknál)
  keywordFilter?: boolean;
}

export interface AppState {
  isMonitoring: boolean;
  delaySeconds: number;
  watchedApps: WatchedApp[];
}

const ICON = (id: string) => `https://play-lh.googleusercontent.com/${id}=s96`;

const DEFAULT_APPS: WatchedApp[] = [
  { packageName: 'net.parkl.androidclient', displayName: 'Parkl', enabled: true, iconUrl: ICON('P9Xv6QIfoZ2WF7NcWD9AKhBNYFe3xirGLuc2rJTDfP6qTKJU68UpE4FcUT7MUCadvS8') },
  { packageName: 'net.easypark.android', displayName: 'EasyPark', enabled: true, iconUrl: ICON('DQE09F_LOjQYuyqYTEV_aMKOtFevOUABxzSGr-ngxN78_ALyY6uNbr73CssttDhrdRQ') },
  { packageName: 'group.flowbird.mpp', displayName: 'Flowbird', enabled: true, iconUrl: ICON('wN4vTO9WnIvRTKNl1Du-UopkB7siyBEGyZuVviuM_Dm3_HxEvclTrlc61E5pEN_TFg') },
  { packageName: 'hu.mol.move', displayName: 'MOL Move', enabled: true, iconUrl: ICON('p84_-6WHqiKRo6MkWfmdo8R6CJZ-KICp6bjgtD-HagHiMOVTiP2DmECG0CWqocnvHXBz2gJ43RaUjnCWU1Xg_RE') },
  { packageName: 'com.mipermit.android', displayName: 'MiPermit', enabled: true, iconUrl: ICON('SLpdnJP6znJMnAI9z4r30zxQjF8nNV1vVAOS51mdh7HeLjQGwP8pBOPQ1NzixK4MIQ') },
  { packageName: 'com.vodafone.easyrider', displayName: 'One Easy Rider', enabled: true, iconUrl: ICON('9jHpgy-Ogphxa_dyziscq2kZn7tQVToPvoVQhJy6cFGQ1yytxKnjM5wtQHprEsYuMQPmWdvHH4U1hY6xFZFTAjY') },
  { packageName: 'com.otpmobil.simple.phoenix', displayName: 'Simple', enabled: true, iconUrl: ICON('g05jSG0BD5TJQ55tcaIgHxlgEq2osTjTlQXsJmyYwHpFQH8Z-jJ5yGkLrJTho7zM78-qz5hBKBWJa9nCfI8rgpo') },
  { packageName: 'telekom.hu.android.mobilvasarlas', displayName: 'Telekom', enabled: true, iconUrl: ICON('xPbyumxzLj-k6sqNp8EgiBFuM6GsELPSRJVxUZjdJbM3IkrLIgX1oOslL4BNd5v1zQ') },
  { packageName: 'com.telenor.mytelenor', displayName: 'Yettel', enabled: true, keywordFilter: true, iconUrl: ICON('YQlFrWliUhKQbPGgaUYuPpoylnIUN-i4wT60mCHL6mPgSWrJpsZkE3gVHmcl8954EDqt_j1oDJV0EYNfrCnA') },
  { packageName: 'hu.parkinghungary.app', displayName: 'Parking Hungary', enabled: true, iconUrl: ICON('gRSD3NLufk6tJ-iYiGRBb2Nc283jcyDgO4aHgHfRY6FkgBpYnShComW0hITgaBPEVdXjJXuHoxiog0uuVTxHBDo') },
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
