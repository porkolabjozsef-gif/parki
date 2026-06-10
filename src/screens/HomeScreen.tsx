import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../services/languageContext';

const GREEN = '#00E5A0';

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { t, currentLang } = useLanguage();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>Par<Text style={styles.accent}>ki</Text></Text>
        <Text style={styles.sub}>{t('appSub')}</Text>

        <Animated.View style={[styles.indicator, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.indicatorEmoji}>🔍</Text>
          <Text style={styles.indicatorLabel}>{t('monitoring')}</Text>
        </Animated.View>

        <Text style={styles.info}>{t('monitoringInfo')}</Text>
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
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderColor: GREEN,
    backgroundColor: 'rgba(0,229,160,0.08)',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  indicatorEmoji: { fontSize: 44 },
  indicatorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: GREEN },
  info: { fontSize: 13, color: '#444', textAlign: 'center', paddingHorizontal: 40 },
});
