import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, AppState, Modal, FlatList, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageContext';
import { getActiveParkingInfo, clearActiveParking, isNotificationAccessGranted, openNotificationAccessSettings } from '../services/monitorService';
import { openParkingApp } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import ParkingMap from '../components/ParkingMap';
import { loadState } from '../services/storageService';
import { useThemeContext } from '../services/themeContext';
import { useProContext } from '../services/proContext';

const GREEN = '#00E5A0';
const ORANGE = '#FF9500';

const BIG = 220;
const SMALL = Math.round(BIG * 0.65);

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { t, currentLang } = useLanguage();
  const { theme } = useThemeContext();
  const styles = useStyles(theme);
  const { isPro } = useProContext();
  const [nearbyModal, setNearbyModal] = useState(false);
  const [nearbyApps, setNearbyApps] = useState<any[]>([]);
  const [nearbyKey, setNearbyKey] = useState(0);
  const [cachedCountry, setCachedCountry] = useState<string | null>(null);
  const [parking, setParking] = useState<{ appName: string; startedAt: number; iconUrl?: string; packageName: string; lat: number; lng: number } | null>(null);
  const [, tick] = useState(0);
  const [notifAccess, setNotifAccess] = useState(true);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const refresh = async () => {
    try { setParking(await getActiveParkingInfo()); } catch (_) {}
    try { setNotifAccess(isNotificationAccessGranted()); } catch (_) {}
    tick(n => n + 1);
  };

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
        setCachedCountry(null); // GPS újralekérdezés előtérbe kerüléskor
      }
    });
    return () => sub.remove();
  }, []);

  const handleStop = async () => {
    if (parking?.packageName) await openParkingApp(parking.packageName);
    await clearActiveParking();
    await refresh();
  };

  const elapsed = parking ? Math.floor((Date.now() - parking.startedAt) / 1000) : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const elapsedStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const active = !!parking;
  const hasGps = active && (parking!.lat !== 0 || parking!.lng !== 0);

  return (
    <>
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {!notifAccess && (
          <TouchableOpacity style={styles.warnBar} onPress={() => openNotificationAccessSettings()}>
            <Text style={styles.warnText}>{t('notifAccessWarn')}</Text>
            <Text style={styles.warnBtn}>{t('enable')}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.logo}>Par<Text style={[styles.accent, { color: active ? ORANGE : GREEN }]}>ki</Text></Text>
        <Text style={styles.sub}>{t('appSub')}</Text>

        {!active && (
          <>
            <Animated.View style={[styles.circleBase, styles.monitorCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.indicatorEmoji}>🔍</Text>
              <Text style={[styles.indicatorLabel, { color: GREEN }]}>{t('monitoring')}</Text>
            </Animated.View>
            <Text style={styles.info}>{t('monitoringInfo')}</Text>
            <TouchableOpacity
              key={nearbyKey}
              style={styles.nearbyBtn}
              onPress={async () => {
                if (!isPro) {
                  Alert.alert('Pro', 'Ez a funkció Pro verzióban érhető el.');
                  return;
                }
                try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('', 'Helyadatok engedély szükséges');
                    return;
                  }
                  let countryCode = cachedCountry || 'HU';
                  if (!cachedCountry) {
                    try {
                      const loc = await Location.getCurrentPositionAsync({});
                      const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&format=json`,
                        { headers: { 'User-Agent': 'Parki/1.0' } }
                      );
                      const geo = await geoRes.json();
                      countryCode = geo.address?.country_code?.toUpperCase() || 'HU';
                      setCachedCountry(countryCode);
                    } catch (_) {}
                  }
                  const communityRes = await fetch('https://raw.githubusercontent.com/porkolabjozsef-gif/parki/main/parking-apps.json');
                  const communityData = await communityRes.json();
                  const state = await loadState();
                  const filtered = state.watchedApps.filter(a => {
                    if (!a.enabled) return false;
                    const ca = communityData.apps.find((x: any) => x.packageName === a.packageName);
                    if (!ca?.country?.length) return true;
                    return ca.country.includes(countryCode);
                  });
                  setNearbyApps(filtered);
                  setNearbyModal(true);
                } catch (e: any) {
                  Alert.alert('Hiba', String(e?.message || e));
                  setNearbyModal(true);
                }
              }}
            >
              <Text style={styles.nearbyBtnText}>{t('nearbyAppsBtn')}</Text>
            </TouchableOpacity>

          </>
        )}

        {active && (
          <>
            <View style={styles.mapArea}>
              {hasGps ? (
                <View style={styles.mapCircle}>
                  <ParkingMap lat={parking!.lat} lng={parking!.lng} label={parking!.appName} elapsedStr={elapsedStr} />
                </View>
              ) : (
                <View style={[styles.circleBase, styles.noGpsCircle]}>
                  <Text style={styles.indicatorEmoji}>🅿️</Text>
                  <Text style={[styles.indicatorLabel, { color: ORANGE }]}>{t('parkingActive')}</Text>
                  <Text style={styles.noGpsTimer}>{elapsedStr}</Text>
                </View>
              )}
            </View>

            <View style={styles.appRow}>
              <Text style={styles.appNameText}>{parking!.appName}</Text>
            </View>

            <TouchableOpacity style={styles.stopBtn} onPress={handleStop} activeOpacity={0.85}>
              <Text style={styles.stopBtnText}>{t('stopParking')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
      <Modal visible={nearbyModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32, maxHeight: '75%' }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>{t('nearbyAppsBtn')}</Text>
            <FlatList
              data={nearbyApps}
              keyExtractor={i => i.packageName}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 }}
                  onPress={() => { setNearbyModal(false); openParkingApp(item.packageName); }}
                >
                  {item.iconUrl ? (
                    <Image source={{ uri: item.iconUrl }} style={{ width: 40, height: 40, borderRadius: 10 }} />
                  ) : (
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: theme.card2, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: theme.text, fontWeight: '700' }}>{item.displayName[0]}</Text>
                    </View>
                  )}
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{item.displayName}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => { setNearbyModal(false); setTimeout(() => setNearbyKey(k => k + 1), 300); }} style={{ marginTop: 16, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.card2, borderRadius: 12 }}>
              <Text style={{ color: theme.textMuted, fontWeight: '600' }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  warnBar: { position: 'absolute', top: 10, left: 16, right: 16, backgroundColor: 'rgba(255,176,32,0.12)', borderWidth: 1, borderColor: '#FFB020', borderRadius: 12, padding: 14, gap: 8 },
  warnText: { color: '#FFB020', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  warnBtn: { color: '#000', backgroundColor: theme.orange, fontSize: 13, fontWeight: '800', textAlign: 'center', paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40, gap: 20 },
  logo: { fontSize: 42, fontWeight: '800', color: theme.text, letterSpacing: -1 },
  accent: { color: GREEN },
  sub: { fontSize: 14, color: theme.textFaint, marginTop: -16 },
  circleBase: {
    width: BIG, height: BIG, borderRadius: BIG / 2,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  monitorCircle: { borderColor: GREEN, backgroundColor: 'rgba(0,229,160,0.08)' },
  noGpsCircle: { borderColor: ORANGE, backgroundColor: 'rgba(255,149,0,0.08)' },
  noGpsTimer: { fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 4, fontVariant: ['tabular-nums'] },
  indicatorEmoji: { fontSize: 44 },
  indicatorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  info: { fontSize: 13, color: theme.textFaint, textAlign: 'center', paddingHorizontal: 40 },
  mapArea: { width: BIG, height: BIG, alignItems: 'center', justifyContent: 'center' },
  mapCircle: {
    width: BIG, height: BIG, borderRadius: BIG / 2, overflow: 'hidden',
    borderWidth: 2, borderColor: ORANGE, backgroundColor: '#0D0D0D',
  },
  appRow: { marginTop: 4 },
  appNameText: { fontSize: 18, fontWeight: '800', color: theme.text },
  testBtn: { marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.textFaintest },
  testBtnText: { color: theme.textMuted, fontSize: 12 },
  stopBtn: { backgroundColor: ORANGE, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, marginTop: 4 },
  stopBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  nearbyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: theme.card, borderWidth: 1, borderColor: GREEN },
  nearbyBtnText: { color: GREEN, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
