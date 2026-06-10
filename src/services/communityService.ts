import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMMUNITY_LIST_URL = 'https://raw.githubusercontent.com/porkolabjozsef-gif/parki/main/parking-apps.json';
const GITHUB_ISSUES_URL = 'https://github.com/porkolabjozsef-gif/parki/issues/new';
const LAST_SYNC_KEY = 'community_last_sync';

export interface CommunityApp {
  packageName: string;
  displayName: string;
  country: string[];
  storeUrl: string;
}

export function extractPackageFromUrl(url: string): string | null {
  try {
    const match = url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function fetchCommunityList(): Promise<CommunityApp[]> {
  try {
    const res = await fetch(COMMUNITY_LIST_URL);
    const data = await res.json();
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return data.apps || [];
  } catch {
    return [];
  }
}

export async function getLastSync(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

export async function submitNewApp(
  displayName: string,
  packageName: string,
  country: string,
  storeUrl: string,
) {
  const title = encodeURIComponent(`New parking app: ${displayName}`);
  const body = encodeURIComponent(
    `**App neve:** ${displayName}\n` +
    `**Csomagnév:** ${packageName}\n` +
    `**Ország:** ${country}\n` +
    `**Play Store:** ${storeUrl}\n\n` +
    `*Beküldve a Parki alkalmazásból*`
  );
  const url = `${GITHUB_ISSUES_URL}?title=${title}&body=${body}&labels=new-app`;
  await Linking.openURL(url);
}
