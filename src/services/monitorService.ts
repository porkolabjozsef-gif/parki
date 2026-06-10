import ExpoNotificationListener, { NotificationData } from 'expo-android-notification-listener-service';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadState, WatchedApp } from './storageService';
import { sendParkingReminder, shouldAlert } from './notificationService';

const GEOFENCE_RADIUS = 200; // méter
const PARKING_KEY = 'parki_active_parking';

interface ActiveParking {
  packageName: string;
  appName: string;
  lat: number;
  lng: number;
  startedAt: number;
  intentionalLeave: boolean; // "Rendben" megnyomva
  reminded: boolean;
}

let listenerSub: { remove: () => void } | null = null;
let watchTimer: ReturnType<typeof setInterval> | null = null;

// Két GPS pont távolsága méterben (Haversine)
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getActiveParking(): Promise<ActiveParking | null> {
  try {
    const raw = await AsyncStorage.getItem(PARKING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function setActiveParking(p: ActiveParking | null) {
  if (p) await AsyncStorage.setItem(PARKING_KEY, JSON.stringify(p));
  else await AsyncStorage.removeItem(PARKING_KEY);
}

// Engedélyek
export function isNotificationAccessGranted(): boolean {
  return ExpoNotificationListener.isNotificationPermissionGranted();
}

export function openNotificationAccessSettings() {
  ExpoNotificationListener.openNotificationListenerSettings();
}

export async function requestLocationPermissions() {
  await Location.requestForegroundPermissionsAsync();
  await Location.requestBackgroundPermissionsAsync();
}

// Egy értesítés feldolgozása
async function handleNotification(event: NotificationData, apps: WatchedApp[]) {
  const app = apps.find(a => a.packageName === event.packageName && a.enabled);
  if (!app) return;

  // keywordFilter: csak parkolás-kulcsszóra
  if (!shouldAlert(app.keywordFilter, event.title, event.text || event.bigText)) return;

  // Parkolás indítása: rögzítjük a helyet
  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const parking: ActiveParking = {
      packageName: app.packageName,
      appName: app.displayName,
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      startedAt: Date.now(),
      intentionalLeave: false,
      reminded: false,
    };
    await setActiveParking(parking);
  } catch (_) {
    // Ha nincs GPS, akkor hely nélkül is jelöljük aktívnak (geofence nélkül időzítve riaszt)
    await setActiveParking({
      packageName: app.packageName, appName: app.displayName,
      lat: 0, lng: 0, startedAt: Date.now(), intentionalLeave: false, reminded: false,
    });
  }
}

// Periodikus ellenőrzés: elhagytad-e a parkolás helyét?
async function checkGeofence() {
  const parking = await getActiveParking();
  if (!parking) return;

  const state = await loadState();
  const delayMs = state.delaySeconds * 1000;

  let left = false;
  if (parking.lat !== 0 || parking.lng !== 0) {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const dist = distanceMeters(parking.lat, parking.lng, loc.coords.latitude, loc.coords.longitude);
      left = dist > GEOFENCE_RADIUS;

      // Visszatért a helyre → szándékos flag törlése
      if (!left && parking.intentionalLeave) {
        parking.intentionalLeave = false;
        parking.reminded = false;
        await setActiveParking(parking);
      }
    } catch (_) {
      left = Date.now() - parking.startedAt > delayMs; // GPS nélkül: időzítve
    }
  } else {
    left = Date.now() - parking.startedAt > delayMs;
  }

  // Elhagyta a helyet, nem szándékos, még nem emlékeztettük, és letelt a késleltetés
  if (left && !parking.intentionalLeave && !parking.reminded &&
      Date.now() - parking.startedAt > delayMs) {
    await sendParkingReminder(parking.appName, parking.packageName);
    parking.reminded = true;
    await setActiveParking(parking);
  }
}

// "Rendben" megnyomva → szándékos elmenetel
export async function markIntentionalLeave() {
  const parking = await getActiveParking();
  if (parking) {
    parking.intentionalLeave = true;
    await setActiveParking(parking);
  }
}

// Aktív parkolás lekérdezése a UI számára
export async function getActiveParkingInfo(): Promise<{ appName: string; startedAt: number } | null> {
  const p = await getActiveParking();
  if (!p) return null;
  return { appName: p.appName, startedAt: p.startedAt };
}

// Parkolás leállítása (Stop vagy manuális)
export async function clearActiveParking() {
  await setActiveParking(null);
}

// Figyelés indítása
export async function startMonitoring() {
  const state = await loadState();
  const enabledPackages = state.watchedApps.filter(a => a.enabled).map(a => a.packageName);
  ExpoNotificationListener.setAllowedPackages(enabledPackages);

  if (listenerSub) listenerSub.remove();
  listenerSub = ExpoNotificationListener.addListener('onNotificationReceived', async (event) => {
    const s = await loadState();
    await handleNotification(event, s.watchedApps);
  });

  if (watchTimer) clearInterval(watchTimer);
  watchTimer = setInterval(checkGeofence, 15000); // 15 másodpercenként ellenőriz
}

export function stopMonitoring() {
  if (listenerSub) { listenerSub.remove(); listenerSub = null; }
  if (watchTimer) { clearInterval(watchTimer); watchTimer = null; }
}
