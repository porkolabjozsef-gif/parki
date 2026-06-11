import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageContext';
import { getActiveParkingInfo, clearActiveParking, isNotificationAccessGranted, openNotificationAccessSettings } from '../services/monitorService';
import { openParkingApp } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import ParkingMap from '../components/ParkingMap';

const GREEN = '#00E5A0';
const ORANGE = '#FF9500';

const BIG = 220;
const SMALL = Math.round(BIG * 0.65);

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { t, currentLang } = useLanguage();
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
              style={styles.testBtn}
              onPress={async () => {
                try {
                  await Location.requestForegroundPermissionsAsync();
                  const loc = await Location.getCurrentPositionAsync({});
                  await AsyncStorage.setItem('parki_active_parking', JSON.stringify({
                    packageName: 'net.parkl.androidclient', appName: 'Parkl',
                    lat: loc.coords.latitude, lng: loc.coords.longitude,
                    startedAt: Date.now(), intentionalLeave: false, reminded: false,
                    iconUrl: 'https://play-lh.googleusercontent.com/P9Xv6QIfoZ2WF7NcWD9AKhBNYFe3xirGLuc2rJTDfP6qTKJU68UpE4FcUT7MUCadvS8=s96',
                  }));
                  await refresh();
                } catch (e) { console.log('teszt hiba', e); }
              }}
            >
              <Text style={styles.testBtnText}>TESZT: parkolás itt</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  warnBar: { position: 'absolute', top: 10, left: 16, right: 16, backgroundColor: 'rgba(255,176,32,0.12)', borderWidth: 1, borderColor: '#FFB020', borderRadius: 12, padding: 14, gap: 8 },
  warnText: { color: '#FFB020', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  warnBtn: { color: '#000', backgroundColor: '#FFB020', fontSize: 13, fontWeight: '800', textAlign: 'center', paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  logo: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  accent: { color: GREEN },
  sub: { fontSize: 14, color: '#444', marginTop: -16 },
  circleBase: {
    width: BIG, height: BIG, borderRadius: BIG / 2,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  monitorCircle: { borderColor: GREEN, backgroundColor: 'rgba(0,229,160,0.08)' },
  noGpsCircle: { borderColor: ORANGE, backgroundColor: 'rgba(255,149,0,0.08)' },
  noGpsTimer: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 4, fontVariant: ['tabular-nums'] },
  indicatorEmoji: { fontSize: 44 },
  indicatorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  info: { fontSize: 13, color: '#444', textAlign: 'center', paddingHorizontal: 40 },
  mapArea: { width: BIG, height: BIG, alignItems: 'center', justifyContent: 'center' },
  mapCircle: {
    width: BIG, height: BIG, borderRadius: BIG / 2, overflow: 'hidden',
    borderWidth: 2, borderColor: ORANGE, backgroundColor: '#0D0D0D',
  },
  appRow: { marginTop: 4 },
  appNameText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  testBtn: { marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  testBtnText: { color: '#666', fontSize: 12 },
  stopBtn: { backgroundColor: ORANGE, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, marginTop: 4 },
  stopBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
