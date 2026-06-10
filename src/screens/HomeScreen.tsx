import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageContext';
import { getActiveParkingInfo } from '../services/monitorService';

const GREEN = '#00E5A0';
const ORANGE = '#FF9500';

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { t, currentLang } = useLanguage();
  const [parking, setParking] = useState<{ appName: string; startedAt: number; iconUrl?: string } | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const update = async () => {
      try { setParking(await getActiveParkingInfo()); } catch (_) {}
      tick(n => n + 1);
    };
    update();
    const iv = setInterval(update, 2000);
    return () => clearInterval(iv);
  }, []);

  const elapsed = parking ? Math.floor((Date.now() - parking.startedAt) / 1000) : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const elapsedStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const active = !!parking;
  const color = active ? ORANGE : GREEN;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>Par<Text style={[styles.accent, { color }]}>ki</Text></Text>
        <Text style={styles.sub}>{t('appSub')}</Text>

        <Animated.View style={[
          styles.indicator,
          { borderColor: color, backgroundColor: active ? 'rgba(255,149,0,0.08)' : 'rgba(0,229,160,0.08)', transform: [{ scale: pulseAnim }] },
        ]}>
          <Text style={styles.indicatorEmoji}>{active ? '🅿️' : '🔍'}</Text>
          <Text style={[styles.indicatorLabel, { color }]}>
            {active ? t('parkingActive') : t('monitoring')}
          </Text>
          {active && <Text style={styles.timer}>{elapsedStr}</Text>}
        </Animated.View>

        {active ? (
          <View style={styles.parkingCard}>
            {parking!.iconUrl ? (
              <Image source={{ uri: parking!.iconUrl }} style={styles.cardIcon} />
            ) : (
              <View style={styles.cardIconFallback}>
                <Text style={styles.cardIconFallbackText}>{parking!.appName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{t('parkingInProgress')}</Text>
              <Text style={styles.cardAppName}>{parking!.appName}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.info}>{t('monitoringInfo')}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  logo: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  accent: { color: GREEN },
  sub: { fontSize: 14, color: '#444', marginTop: -16 },
  indicator: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  indicatorEmoji: { fontSize: 44 },
  indicatorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  timer: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 4, fontVariant: ['tabular-nums'] },
  info: { fontSize: 13, color: '#444', textAlign: 'center', paddingHorizontal: 40 },
  parkingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: 'rgba(255,149,0,0.3)',
    borderRadius: 16, padding: 16, paddingRight: 24,
  },
  cardIcon: { width: 48, height: 48, borderRadius: 12 },
  cardIconFallback: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,149,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardIconFallbackText: { color: ORANGE, fontSize: 22, fontWeight: '800' },
  cardText: { gap: 2 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: ORANGE },
  cardAppName: { fontSize: 20, fontWeight: '800', color: '#fff' },
});
