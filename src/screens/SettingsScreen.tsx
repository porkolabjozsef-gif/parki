import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Linking, Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState } from '../services/storageService';

const GREEN = '#00E5A0';
const BG = '#000000';
const CARD = '#0D0D0D';
const BORDER = '#1A1A1A';

export default function SettingsScreen() {
  const [delay, setDelay] = useState(30);

  useEffect(() => {
    loadState().then(s => setDelay(s.delaySeconds));
  }, []);

  const saveDelay = async (val: number) => {
    setDelay(val);
    const state = await loadState();
    await saveState({ ...state, delaySeconds: val });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Beállítások</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>KÉSLELTETÉS</Text>
          <Text style={styles.delayText}>
            Indulás után <Text style={styles.delayHighlight}>{delay} másodperccel</Text> értesít
          </Text>
          <View style={styles.delayButtons}>
            {[10, 20, 30, 45, 60, 90, 120].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.delayBtn, delay === val && styles.delayBtnActive]}
                onPress={() => saveDelay(val)}
              >
                <Text style={[styles.delayBtnText, delay === val && styles.delayBtnTextActive]}>
                  {val}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ENGEDÉLYEK</Text>
          <TouchableOpacity style={styles.permBtn} onPress={() => Linking.openSettings()}>
            <View>
              <Text style={styles.permTitle}>Értesítési hozzáférés</Text>
              <Text style={styles.permSub}>Szükséges a parkoló appok értesítéseinek figyeléséhez</Text>
            </View>
            <Text style={styles.permArrow}>›</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' && (
            <TouchableOpacity style={[styles.permBtn, { marginTop: 8 }]} onPress={() => Linking.openSettings()}>
              <View>
                <Text style={styles.permTitle}>Akkumulátor optimalizálás</Text>
                <Text style={styles.permSub}>Tiltsa le a Parki-ra, hogy háttérben működjön</Text>
              </View>
              <Text style={styles.permArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>NÉVJEGY</Text>
          <Text style={styles.aboutName}>
            Par<Text style={{ color: GREEN }}>ki</Text>
            {'  '}
            <Text style={styles.aboutVersion}>v1.0.0</Text>
          </Text>
          <Text style={styles.aboutDesc}>
            Univerzális parkolás emlékeztető. Figyeli az aktív parkolási értesítéseket és szól, ha elfelejtette leállítani.
          </Text>
          <Text style={styles.aboutPrivacy}>
            🔒 Nem gyűjt adatot · Nincs regisztráció · Teljesen offline
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  card: { padding: 20, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#444' },
  delayText: { color: '#888', fontSize: 15 },
  delayHighlight: { color: GREEN, fontWeight: '700' },
  delayButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  delayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#222' },
  delayBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  delayBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },
  delayBtnTextActive: { color: '#000' },
  permBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: '#111' },
  permTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  permSub: { color: '#444', fontSize: 12, marginTop: 2, maxWidth: '90%' },
  permArrow: { color: '#444', fontSize: 20 },
  aboutName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  aboutVersion: { fontSize: 14, color: '#444', fontWeight: '400' },
  aboutDesc: { color: '#666', fontSize: 14, lineHeight: 20 },
  aboutPrivacy: { color: '#333', fontSize: 12 },
});
