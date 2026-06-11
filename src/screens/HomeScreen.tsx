import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageContext';
import { getActiveParkingInfo, clearActiveParking } from '../services/monitorService';
import { openParkingApp } from '../services/notificationService';
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
        <Text style={styles.logo}>Par<Text style={[styles.accent, { color: active ? ORANGE : GREEN }]}>ki</Text></Text>
        <Text style={styles.sub}>{t('appSub')}</Text>

        {!active && (
          <>
            <Animated.View style={[styles.circleBase, styles.monitorCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.indicatorEmoji}>🔍</Text>
              <Text style={[styles.indicatorLabel, { color: GREEN }]}>{t('monitoring')}</Text>
            </Animated.View>
            <Text style={styles.info}>{t('monitoringInfo')}</Text>
          </>
        )}

        {active && (
          <>
            <View style={styles.mapArea}>
              {hasGps ? (
                <View style={styles.mapCircle}>
                  <ParkingMap lat={parking!.lat} lng={parking!.lng} label={parking!.appName} />
                </View>
              ) : (
                <View style={[styles.circleBase, styles.noGpsCircle]}>
                  <Text style={styles.indicatorEmoji}>🅿️</Text>
                  <Text style={[styles.indicatorLabel, { color: ORANGE }]}>{t('parkingActive')}</Text>
                </View>
              )}

              {/* Kis kör jobbra fent: P + idő */}
              <View style={styles.smallCircle}>
                <Text style={styles.smallEmoji}>🅿️</Text>
                <Text style={styles.smallTimer}>{elapsedStr}</Text>
              </View>
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
  indicatorEmoji: { fontSize: 44 },
  indicatorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  info: { fontSize: 13, color: '#444', textAlign: 'center', paddingHorizontal: 40 },
  mapArea: { width: BIG, height: BIG, alignItems: 'center', justifyContent: 'center' },
  mapCircle: {
    width: BIG, height: BIG, borderRadius: BIG / 2, overflow: 'hidden',
    borderWidth: 2, borderColor: ORANGE, backgroundColor: '#0D0D0D',
  },
  smallCircle: {
    position: 'absolute', top: -SMALL * 0.15, right: -SMALL * 0.15,
    width: SMALL, height: SMALL, borderRadius: SMALL / 2,
    backgroundColor: '#0D0D0D', borderWidth: 2, borderColor: ORANGE,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  smallEmoji: { fontSize: 24 },
  smallTimer: { fontSize: 26, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  appRow: { marginTop: 4 },
  appNameText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  stopBtn: { backgroundColor: ORANGE, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, marginTop: 4 },
  stopBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
