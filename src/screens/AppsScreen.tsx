import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, Modal, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState, WatchedApp } from '../services/storageService';
import { useLanguage } from '../services/languageContext';
import { submitNewApp, extractPackageFromUrl } from '../services/communityService';

const GREEN = '#00E5A0';
const BG = '#000000';
const CARD = '#0D0D0D';
const BORDER = '#1A1A1A';

const COUNTRIES = ['HU','AT','DE','FR','GB','US','PL','CZ','SK','RO','HR','RS','SI','IT','ES','PT','NL','BE','SE','NO','DK','FI','UA','TR','RU'];

const APP_COLORS: Record<string, string> = {
  'net.parkl.androidclient': '#1A6BFF',
  'net.easypark.android': '#FF6B00',
  'com.parkmobile.android': '#6B00FF',
  'com.flowbird.android': '#00BFFF',
  'hu.mol.move': '#FF0000',
  'com.mypermit.android': '#00AA44',
  'com.vodafone.easyrider': '#00B8D4',
  'com.otpmobil.simple.phoenix': '#3DAA2E',
  'telekom.hu.android.mobilvasarlas': '#6600CC',
  'hu.parkinghungary.app': '#FF6600',
};

function getAppColor(pkg: string) {
  return APP_COLORS[pkg] || '#555';
}

function getAppInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AppsScreen() {
  const [apps, setApps] = useState<WatchedApp[]>([]);
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});
  const [submitModal, setSubmitModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [packageName, setPackageName] = useState('');
  const [country, setCountry] = useState('HU');
  const { t, currentLang } = useLanguage();

  useEffect(() => {
    loadState().then(s => setApps(s.watchedApps));
  }, []);

  useEffect(() => {
    const pkg = extractPackageFromUrl(storeUrl);
    if (pkg) setPackageName(pkg);
  }, [storeUrl]);

  const persist = async (updated: WatchedApp[]) => {
    setApps(updated);
    const state = await loadState();
    await saveState({ ...state, watchedApps: updated });
  };

  const toggleApp = async (pkg: string) => {
    const updated = apps.map(a =>
      a.packageName === pkg ? { ...a, enabled: !a.enabled } : a
    );
    await persist(updated);
  };

  const deleteApp = (pkg: string) => {
    Alert.alert(t('deleteConfirm'), '', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('deleteConfirm'), style: 'destructive', onPress: async () => {
        await persist(apps.filter(a => a.packageName !== pkg));
      }},
    ]);
  };

  const handleSubmit = async () => {
    if (!appName.trim() || !packageName.trim()) {
      Alert.alert('', t('fillAllFields'));
      return;
    }
    await submitNewApp(appName.trim(), packageName.trim(), country, storeUrl.trim());
    setSubmitModal(false);
    setAppName('');
    setStoreUrl('');
    setPackageName('');
    setCountry('HU');
  };

  const sortedApps = [...apps].sort((a, b) => a.displayName.localeCompare(b.displayName, 'hu'));

  const renderItem = ({ item }: { item: WatchedApp }) => {
    const color = getAppColor(item.packageName);
    const showIcon = item.iconUrl && !failedIcons[item.packageName];
    return (
      <TouchableOpacity
        style={[styles.gridItem, !item.enabled && styles.gridItemDisabled]}
        onPress={() => toggleApp(item.packageName)}
        onLongPress={() => deleteApp(item.packageName)}
        activeOpacity={0.7}
      >
        {showIcon ? (
          <View style={[styles.iconImageWrap, { borderColor: item.enabled ? color : '#222' }]}>
            <Image
              source={{ uri: item.iconUrl }}
              style={styles.iconImage}
              onError={() => setFailedIcons(prev => ({ ...prev, [item.packageName]: true }))}
            />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: item.enabled ? color + '22' : '#111', borderColor: item.enabled ? color : '#222' }]}>
            <Text style={[styles.iconText, { color: item.enabled ? color : '#444' }]}>
              {getAppInitials(item.displayName)}
            </Text>
          </View>
        )}
        <Text style={[styles.appName, !item.enabled && styles.appNameOff]} numberOfLines={2}>
          {item.displayName}
        </Text>
        {item.enabled && <View style={[styles.activeDot, { backgroundColor: color }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('watchedApps')}</Text>
      </View>

      <Text style={styles.hint}>{t('tapToToggle')}</Text>

      <FlatList
        data={sortedApps}
        keyExtractor={a => a.packageName}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
        ListFooterComponent={
          <TouchableOpacity style={styles.submitFooter} onPress={() => setSubmitModal(true)}>
            <Text style={styles.submitFooterText}>{t('submitApp')}</Text>
            <Text style={styles.submitFooterSub}>{t('submitFooterSub')}</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={submitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('submitTitle')}</Text>
            <Text style={styles.submitGuide}>{t('submitGuide')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('appNameLabel')}
              placeholderTextColor="#444"
              value={appName}
              onChangeText={setAppName}
            />
            <TextInput
              style={styles.input}
              placeholder={t('storeUrlLabel')}
              placeholderTextColor="#444"
              value={storeUrl}
              onChangeText={setStoreUrl}
              autoCapitalize="none"
            />
            {packageName ? (
              <View style={styles.packageDetected}>
                <Text style={styles.packageDetectedLabel}>{t('packageDetected')}:</Text>
                <Text style={styles.packageDetectedValue}>{packageName}</Text>
              </View>
            ) : null}

            <Text style={styles.countryLabel}>{t('countryLabel')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
              {COUNTRIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.countryBtn, country === c && styles.countryBtnActive]}
                  onPress={() => setCountry(c)}
                >
                  <Text style={[styles.countryBtnText, country === c && styles.countryBtnTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.submitNote}>{t('submitNote')}</Text>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSubmitModal(false)}>
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleSubmit}>
                <Text style={styles.modalAddText}>{t('submitBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  hint: { fontSize: 12, color: '#333', paddingHorizontal: 20, paddingBottom: 12 },
  grid: { padding: 12 },
  row: { justifyContent: 'flex-start' },
  gridItem: {
    width: '30%', margin: '1.5%', aspectRatio: 0.85,
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
    padding: 12, gap: 8,
  },
  gridItemDisabled: { opacity: 0.4 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 18, fontWeight: '800' },
  iconImageWrap: {
    width: 56, height: 56, borderRadius: 14,
    borderWidth: 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  iconImage: { width: '100%', height: '100%' },
  appName: { fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' },
  appNameOff: { color: '#444' },
  activeDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', top: 10, right: 10 },
  submitFooter: {
    margin: 6, marginTop: 16, padding: 20, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)', borderStyle: 'dashed',
    alignItems: 'center', gap: 4,
  },
  submitFooterText: { color: GREEN, fontWeight: '700', fontSize: 14 },
  submitFooterSub: { color: '#444', fontSize: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%', gap: 12 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  submitGuide: { color: '#555', fontSize: 13, lineHeight: 22, backgroundColor: '#0A0A0A', padding: 12, borderRadius: 10 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#222' },
  packageDetected: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: 10 },
  packageDetectedLabel: { color: GREEN, fontSize: 12, fontWeight: '700' },
  packageDetectedValue: { color: '#fff', fontSize: 12, flex: 1 },
  countryLabel: { color: '#666', fontSize: 13 },
  countryScroll: { maxHeight: 44 },
  countryBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1A1A1A', marginRight: 6, borderWidth: 1, borderColor: '#222' },
  countryBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  countryBtnText: { color: '#666', fontWeight: '600', fontSize: 12 },
  countryBtnTextActive: { color: '#000' },
  submitNote: { color: '#333', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1A1A1A', alignItems: 'center' },
  modalCancelText: { color: '#888', fontWeight: '600' },
  modalAddBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center' },
  modalAddText: { color: '#000', fontWeight: '700' },
});
