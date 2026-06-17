import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Linking, Platform,
  TouchableOpacity, ScrollView, FlatList, Modal,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState } from '../services/storageService';
import { LANGUAGES } from '../services/i18nService';
import { useLanguage } from '../services/languageContext';
import { fetchCommunityList, getLastSync } from '../services/communityService';
import { openNotificationAccessSettings, isNotificationAccessGranted } from '../services/monitorService';
import * as IntentLauncher from 'expo-intent-launcher';
import { useThemeContext } from '../services/themeContext';
import appJson from '../../app.json';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { setCarDeviceName, getCarDeviceName } from '../services/bluetoothService';

const GREEN = '#00E5A0';

const SORTED_LANGUAGES = [...LANGUAGES].sort((a, b) => a.name.localeCompare(b.name));

export default function SettingsScreen() {
  const [delay, setDelay] = useState(30);
  const [langModal, setLangModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notifAccess, setNotifAccess] = useState(false);
  const [btModal, setBtModal] = useState(false);
  const [btDevices, setBtDevices] = useState<{name: string, address: string}[]>([]);
  const [carDevice, setCarDevice] = useState<string | null>(null);
  const [btLoading, setBtLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { t, currentLang, changeLanguage } = useLanguage();
  const { theme, mode, setMode } = useThemeContext();
  const styles = useStyles(theme);

  useEffect(() => {
    loadState().then(s => {
      setDelay(s.delaySeconds);
      const saved = s.carDeviceName ?? null;
      setCarDevice(saved);
      setCarDeviceName(saved);
    });
    getLastSync().then(setLastSync);
    try { setNotifAccess(isNotificationAccessGranted()); } catch (_) {}
  }, []);

  const openBtPicker = async () => {
    setBtLoading(true);
    setBtModal(true);
    try {
      if (Platform.OS === 'android') {
        const { PermissionsAndroid } = require('react-native');
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }
      const paired = await RNBluetoothClassic.getBondedDevices();
      setBtDevices(paired.map(d => ({ name: d.name || d.address, address: d.address })));
    } catch (e) {
      setBtDevices([]);
    }
    setBtLoading(false);
  };

  const selectBtDevice = async (name: string | null) => {
    setCarDevice(name);
    setCarDeviceName(name);
    const state = await loadState();
    await saveState({ ...state, carDeviceName: name });
    setBtModal(false);
  };

  const saveDelay = async (val: number) => {
    setDelay(val);
    const state = await loadState();
    await saveState({ ...state, delaySeconds: val });
  };

  const handleSync = async () => {
    setSyncing(true);
    const communityApps = await fetchCommunityList();
    setSyncing(false);
    if (communityApps.length > 0) {
      const state = await loadState();
      const existing = state.watchedApps.map(a => a.packageName);
      const newApps = communityApps
        .filter(a => !existing.includes(a.packageName))
        .map(a => ({ packageName: a.packageName, displayName: a.displayName, enabled: true, iconUrl: undefined }));
      if (newApps.length > 0) {
        await saveState({ ...state, watchedApps: [...state.watchedApps, ...newApps] });
      }
      const sync = await getLastSync();
      setLastSync(sync);
      Alert.alert('✓', `${communityApps.length} ${t('syncSuccess')}`);
    } else {
      Alert.alert('', t('syncError'));
    }
  };

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang);

  const formatSync = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch { return iso; }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('settings')}</Text>

        {/* Késleltetés */}
        {/* Téma */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('themeAppearance')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['dark', 'light', 'system'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.delayBtn, mode === m && { backgroundColor: GREEN, borderColor: GREEN }]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.delayBtnText, mode === m && { color: '#000' }]}>
                  {m === 'dark' ? t('themeDark') : m === 'light' ? t('themeLight') : t('themeAuto')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('delay')}</Text>
          <Text style={styles.delayText}>{t('delayText', { delay })}</Text>
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

        {/* Nyelv */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('language')}</Text>
          <TouchableOpacity style={styles.langSelector} onPress={() => setLangModal(true)}>
            <Text style={styles.langFlag}>{currentLangObj?.flag}</Text>
            <Text style={styles.langName}>{currentLangObj?.name}</Text>
            <Text style={styles.langArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Közösségi lista */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('communityList')}</Text>
          {lastSync && (
            <Text style={styles.syncText}>{t('lastSync')}: {formatSync(lastSync)}</Text>
          )}
          <TouchableOpacity style={styles.communityBtn} onPress={handleSync} disabled={syncing}>
            {syncing
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.communityBtnText}>{t('refreshList')}</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/porkolabjozsef-gif/parki')}>
            <Text style={styles.githubLink}>github.com/porkolabjozsef-gif/parki ›</Text>
          </TouchableOpacity>
        </View>

        {/* Engedélyek */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('permissions')}</Text>
          <TouchableOpacity style={styles.permBtn} onPress={() => { openNotificationAccessSettings(); setTimeout(() => { try { setNotifAccess(isNotificationAccessGranted()); } catch (_) {} }, 1000); }}>
            <View style={styles.permInfo}>
              <Text style={styles.permTitle}>{t('notificationAccess')}</Text>
              <Text style={styles.permSub}>{t('notificationAccessSub')}</Text>
            </View>
            <Text style={notifAccess ? styles.permOk : styles.permWarn}>{notifAccess ? '✓' : '!'}</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' && (
            <TouchableOpacity style={[styles.permBtn, { marginTop: 8 }]} onPress={() => IntentLauncher.startActivityAsync('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')}>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>{t('batteryOptimization')}</Text>
                <Text style={styles.permSub}>{t('batteryOptimizationSub')}</Text>
              </View>
              <Text style={styles.permArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Autó Bluetooth eszköz */}
          {Platform.OS === 'android' && (
            <TouchableOpacity style={[styles.permBtn, { marginTop: 8 }]} onPress={openBtPicker}>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>{t('carDeviceTitle')}</Text>
                <Text style={styles.permSub}>{carDevice ?? t('carDeviceNotSelected')}</Text>
              </View>
              <Text style={styles.permArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BT eszköz választó modal */}
        <Modal visible={btModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('carDeviceSelectTitle')}</Text>
              {btLoading && <ActivityIndicator color={GREEN} />}
              <ScrollView style={{ maxHeight: 300 }}>
              {btDevices.map(d => (
                <TouchableOpacity key={d.address} style={styles.btDeviceBtn} onPress={() => selectBtDevice(d.name)}>
                  <Text style={styles.btDeviceName}>{d.name}</Text>
                  <Text style={styles.btDeviceAddr}>{d.address}</Text>
                </TouchableOpacity>
              ))}
              </ScrollView>
              {!btLoading && btDevices.length === 0 && (
                <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Nincs párosított eszköz</Text>
              )}
              <TouchableOpacity style={[styles.btDeviceBtn, { marginTop: 8 }]} onPress={() => selectBtDevice(null)}>
                <Text style={{ color: '#ff4444' }}>{t('carDeviceRemove')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setBtModal(false)} style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: theme.textMuted }}>Mégse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Névjegy */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('about')}</Text>
          <Text style={styles.aboutName}>
            Par<Text style={{ color: GREEN }}>ki</Text>
            {'  '}
            <Text style={styles.aboutVersion}>v{appJson.expo.version}</Text>
          </Text>
          <Text style={styles.aboutDesc}>{t('aboutDesc')}</Text>
          <Text style={styles.aboutPrivacy}>{t('privacy')}</Text>
          <TouchableOpacity
            style={styles.kofiBtn}
            onPress={() => Linking.openURL('https://ko-fi.com/parkiapp')}
          >
            <Text style={styles.kofiBtnText}>{t('supportMe')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Nyelvválasztó modal */}
      <Modal visible={langModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            <FlatList
              data={SORTED_LANGUAGES}
              keyExtractor={l => l.code}
              numColumns={2}
              contentContainerStyle={styles.langGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langItem, item.code === currentLang && styles.langItemActive]}
                  onPress={async () => { await changeLanguage(item.code); setLangModal(false); }}
                >
                  <Text style={styles.langItemFlag}>{item.flag}</Text>
                  <Text style={[styles.langItemName, item.code === currentLang && styles.langItemNameActive]}>
                    {item.name}
                  </Text>
                  {item.code === currentLang && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setLangModal(false)}>
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 8 },
  card: { padding: 20, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: theme.textFaint },
  delayText: { color: theme.textSub, fontSize: 15 },
  delayButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  delayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.border, borderWidth: 1, borderColor: theme.border2 },
  delayBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  delayBtnText: { color: theme.textSub, fontSize: 13, fontWeight: '600' },
  delayBtnTextActive: { color: '#000' },
  langSelector: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: theme.card2, gap: 12 },
  langFlag: { fontSize: 24 },
  langName: { flex: 1, color: theme.text, fontSize: 16, fontWeight: '600' },
  langArrow: { color: theme.textFaint, fontSize: 20 },
  syncText: { fontSize: 12, color: theme.textFaint },
  communityBtn: { padding: 14, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center' },
  communityBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  githubLink: { color: theme.textFaintest, fontSize: 12, textAlign: 'center' },
  permBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: theme.card2 },
  permInfo: { flex: 1 },
  permTitle: { color: theme.text, fontWeight: '600', fontSize: 14 },
  permSub: { color: theme.textFaint, fontSize: 12, marginTop: 2 },
  permArrow: { color: theme.textFaint, fontSize: 20 },
  permOk: { color: '#00E5A0', fontSize: 18, fontWeight: '800' },
  permWarn: { color: '#FFB020', fontSize: 18, fontWeight: '800', width: 24, height: 24, textAlign: 'center', borderRadius: 12, borderWidth: 2, borderColor: '#FFB020' },
  aboutName: { fontSize: 20, fontWeight: '800', color: theme.text },
  aboutVersion: { fontSize: 14, color: theme.textFaint, fontWeight: '400' },
  aboutDesc: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  aboutPrivacy: { color: theme.textFaintest, fontSize: 12 },
  kofiBtn: { marginTop: 8, padding: 14, borderRadius: 12, backgroundColor: 'rgba(0,229,160,0.1)', borderWidth: 1, borderColor: 'rgba(0,229,160,0.25)', alignItems: 'center' },
  kofiBtnText: { color: '#00E5A0', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.card2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  langGrid: { gap: 8 },
  langItem: { flex: 1, margin: 4, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: theme.border, borderWidth: 1, borderColor: theme.border2, gap: 8 },
  langItemActive: { borderColor: GREEN, backgroundColor: 'rgba(0,229,160,0.08)' },
  langItemFlag: { fontSize: 20 },
  langItemName: { flex: 1, color: theme.textSub, fontSize: 13, fontWeight: '600' },
  langItemNameActive: { color: GREEN },
  langCheck: { color: GREEN, fontWeight: '700' },
  modalClose: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: theme.border, alignItems: 'center' },
  modalCloseText: { color: theme.textSub, fontWeight: '600', fontSize: 15 },
  btDeviceBtn: { padding: 14, borderRadius: 10, backgroundColor: "#161616", marginTop: 8 },
  btDeviceName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  btDeviceAddr: { color: "#555", fontSize: 12, marginTop: 2 },
});
