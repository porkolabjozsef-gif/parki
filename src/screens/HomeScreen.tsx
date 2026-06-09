import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ScrollView, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState, AppState } from '../services/storageService';
import { sendParkingReminder } from '../services/notificationService';

const GREEN = '#00E5A0';
const BG = '#000000';
const CARD = '#0D0D0D';
const BORDER = '#1A1A1A';

export default function HomeScreen() {
  const [state, setState] = useState<AppState | null>(null);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadState().then(setState);
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (state?.isMonitoring) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.94, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state?.isMonitoring]);

  const checkNotificationPermission = async () => {
    // On Android, check if notification listener is enabled
    setHasNotifPermission(true); // simplified - real check via native module
  };

  const toggleMonitoring = async () => {
    if (!state) return;
    const updated = { ...state, isMonitoring: !state.isMonitoring };
    setState(updated);
    await saveState(updated);
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  // Test notification button (for development)
  const testNotification = async () => {
    await sendParkingReminder('Parkl');
  };

  if (!state) return null;

  const enabledCount = state.watchedApps.filter(a => a.enabled).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Par<Text style={styles.logoAccent}>ki</Text>
          </Text>
          <Text style={styles.subtitle}>Parkolás emlékeztető</Text>
        </View>

        {/* Main indicator */}
        <Animated.View style={[styles.indicatorWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[
            styles.indicator,
            state.isMonitoring && styles.indicatorActive,
          ]}>
            <Text style={styles.indicatorEmoji}>
              {state.isMonitoring ? '🅿️' : '🚗'}
            </Text>
            <Text style={[
              styles.indicatorLabel,
              state.isMonitoring && styles.indicatorLabelActive,
            ]}>
              {state.isMonitoring ? 'FIGYELÉS AKTÍV' : 'KIKAPCSOLVA'}
            </Text>
          </View>
        </Animated.View>

        {/* Info text */}
        <Text style={styles.infoText}>
          {state.isMonitoring
            ? `${enabledCount} parkoló alkalmazás figyelve`
            : 'Indítsa el a figyelést a gombbal'}
        </Text>

        {/* Main toggle button */}
        <TouchableOpacity
          style={[styles.toggleBtn, state.isMonitoring && styles.toggleBtnActive]}
          onPress={toggleMonitoring}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleBtnText, state.isMonitoring && styles.toggleBtnTextActive]}>
            {state.isMonitoring ? '⏸  Figyelés leállítása' : '▶  Figyelés indítása'}
          </Text>
        </TouchableOpacity>

        {/* Permission warning */}
        {!hasNotifPermission && (
          <TouchableOpacity style={styles.warningCard} onPress={openNotificationSettings}>
            <Text style={styles.warningText}>
              ⚠️  Értesítési hozzáférés szükséges
            </Text>
            <Text style={styles.warningSubtext}>
              Koppintson a beállítások megnyitásához → Értesítési hozzáférés → Parki
            </Text>
          </TouchableOpacity>
        )}

        {/* How it works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hogyan működik?</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>Elindítja a parkolást a kedvenc appjában</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>Parki figyeli az aktív parkolási értesítést</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Elinduláskor értesítést küld ha elfelejtette leállítani</Text>
          </View>
        </View>

        {/* Dev test button */}
        <TouchableOpacity style={styles.testBtn} onPress={testNotification}>
          <Text style={styles.testBtnText}>🔔 Teszt értesítés küldése</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 8 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  logoAccent: { color: GREEN },
  subtitle: { fontSize: 14, color: '#444', marginTop: 4, letterSpacing: 1 },

  indicatorWrap: { marginBottom: 20 },
  indicator: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 2, borderColor: '#222',
    backgroundColor: '#0A0A0A',
    alignItems: 'center', justifyContent: 'center',
  },
  indicatorActive: {
    borderColor: GREEN,
    backgroundColor: 'rgba(0,229,160,0.08)',
  },
  indicatorEmoji: { fontSize: 52 },
  indicatorLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: '#333', marginTop: 10,
  },
  indicatorLabelActive: { color: GREEN },

  infoText: { color: '#444', fontSize: 14, marginBottom: 32, textAlign: 'center' },

  toggleBtn: {
    paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#222',
    backgroundColor: '#0D0D0D', marginBottom: 24, width: '100%',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  toggleBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  toggleBtnTextActive: { color: '#000' },

  warningCard: {
    width: '100%', padding: 16, borderRadius: 12,
    backgroundColor: 'rgba(255,60,60,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,60,60,0.2)',
    marginBottom: 20,
  },
  warningText: { color: '#ff6b6b', fontWeight: '700', fontSize: 14 },
  warningSubtext: { color: '#ff6b6b', fontSize: 12, marginTop: 4, opacity: 0.7 },

  card: {
    width: '100%', padding: 20, borderRadius: 16,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    marginBottom: 20,
  },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,229,160,0.1)',
    color: GREEN, textAlign: 'center', lineHeight: 28,
    fontWeight: '700', fontSize: 13, marginRight: 12,
  },
  stepText: { color: '#888', fontSize: 14, flex: 1, lineHeight: 20 },

  testBtn: {
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#222',
    width: '100%', alignItems: 'center',
  },
  testBtnText: { color: '#444', fontSize: 14 },
});
