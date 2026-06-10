import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Switch, TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState, WatchedApp } from '../services/storageService';

const GREEN = '#00E5A0';
const BG = '#000000';
const CARD = '#0D0D0D';
const BORDER = '#1A1A1A';

const APP_COLORS: Record<string, string> = {
  'hu.parkl.android': '#1A6BFF',
  'com.easypark.android': '#FF6B00',
  'com.parkmobile.android': '#6B00FF',
  'com.flowbird.android': '#00BFFF',
  'hu.mol.move': '#FF0000',
  'com.mypermit.android': '#00AA44',
  'com.vodafone.easyrider': '#00B8D4',
  'com.otpmobil.simple.phoenix': '#3DAA2E',
};

function getAppColor(pkg: string) {
  return APP_COLORS[pkg] || '#555';
}

function getAppInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AppsScreen() {
  const [apps, setApps] = useState<WatchedApp[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPackage, setNewPackage] = useState('');

  useEffect(() => {
    loadState().then(s => setApps(s.watchedApps));
  }, []);

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
    Alert.alert('Törlés', 'Biztosan törli?', [
      { text: 'Mégse', style: 'cancel' },
      { text: 'Törlés', style: 'destructive', onPress: async () => {
        await persist(apps.filter(a => a.packageName !== pkg));
      }},
    ]);
  };

  const addApp = async () => {
    if (!newName.trim() || !newPackage.trim()) return;
    if (apps.some(a => a.packageName === newPackage.trim())) {
      Alert.alert('Már létezik');
      return;
    }
    await persist([...apps, { packageName: newPackage.trim(), displayName: newName.trim(), enabled: true }]);
    setNewName('');
    setNewPackage('');
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: WatchedApp }) => {
    const color = getAppColor(item.packageName);
    return (
      <TouchableOpacity
        style={[styles.gridItem, !item.enabled && styles.gridItemDisabled]}
        onPress={() => toggleApp(item.packageName)}
        onLongPress={() => deleteApp(item.packageName)}
        activeOpacity={0.7}
      >
        {/* Ikon kör */}
        <View style={[styles.iconCircle, { backgroundColor: item.enabled ? color + '22' : '#111', borderColor: item.enabled ? color : '#222' }]}>
          <Text style={[styles.iconText, { color: item.enabled ? color : '#444' }]}>
            {getAppInitials(item.displayName)}
          </Text>
        </View>
        {/* Név */}
        <Text style={[styles.appName, !item.enabled && styles.appNameOff]} numberOfLines={2}>
          {item.displayName}
        </Text>
        {/* Aktív jelző */}
        {item.enabled && <View style={[styles.activeDot, { backgroundColor: color }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Figyelt alkalmazások</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Hozzáad</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Koppints a ki/bekapcsoláshoz · Hosszan tartva törölhető</Text>

      <FlatList
        data={apps}
        keyExtractor={a => a.packageName}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Alkalmazás hozzáadása</Text>
            <TextInput
              style={styles.input}
              placeholder="Név (pl. Parkl)"
              placeholderTextColor="#444"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Csomagnév (pl. hu.parkl.android)"
              placeholderTextColor="#444"
              value={newPackage}
              onChangeText={setNewPackage}
              autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={addApp}>
                <Text style={styles.modalAddText}>Hozzáadás</Text>
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
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0,229,160,0.1)', borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)' },
  addBtnText: { color: GREEN, fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 12, color: '#333', paddingHorizontal: 20, paddingBottom: 12 },
  grid: { padding: 12 },
  gridItem: {
    flex: 1, margin: 6, aspectRatio: 0.85,
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
  appName: { fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' },
  appNameOff: { color: '#444' },
  activeDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', top: 10, right: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#222' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1A1A1A', alignItems: 'center' },
  modalCancelText: { color: '#888', fontWeight: '600' },
  modalAddBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center' },
  modalAddText: { color: '#000', fontWeight: '700' },
});
