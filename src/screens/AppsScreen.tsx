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
    Alert.alert('Törlés', 'Biztosan törli ezt az alkalmazást?', [
      { text: 'Mégse', style: 'cancel' },
      {
        text: 'Törlés', style: 'destructive',
        onPress: async () => {
          await persist(apps.filter(a => a.packageName !== pkg));
        },
      },
    ]);
  };

  const addApp = async () => {
    if (!newName.trim() || !newPackage.trim()) return;
    if (apps.some(a => a.packageName === newPackage.trim())) {
      Alert.alert('Már létezik', 'Ez az alkalmazás már a listában van.');
      return;
    }
    const updated = [...apps, {
      packageName: newPackage.trim(),
      displayName: newName.trim(),
      enabled: true,
    }];
    await persist(updated);
    setNewName('');
    setNewPackage('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Figyelt alkalmazások</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Hozzáad</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Kapcsolja be azokat az alkalmazásokat, amelyekkel parkolni szokott.
        </Text>
      </View>

      <FlatList
        data={apps}
        keyExtractor={a => a.packageName}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.appCard, item.enabled && styles.appCardActive]}>
            <View style={[styles.appIcon, item.enabled && styles.appIconActive]}>
              <Text style={{ fontSize: 20 }}>🅿️</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, !item.enabled && styles.appNameOff]}>
                {item.displayName}
              </Text>
              <Text style={styles.appPkg} numberOfLines={1}>{item.packageName}</Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleApp(item.packageName)}
              trackColor={{ false: '#222', true: 'rgba(0,229,160,0.3)' }}
              thumbColor={item.enabled ? GREEN : '#444'}
            />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteApp(item.packageName)}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add app modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Alkalmazás hozzáadása</Text>
            <TextInput
              style={styles.input}
              placeholder="Alkalmazás neve (pl. Parkl)"
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
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)',
  },
  addBtnText: { color: GREEN, fontWeight: '700', fontSize: 14 },
  infoCard: {
    marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 12,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  infoText: { color: '#555', fontSize: 13 },
  list: { padding: 16, gap: 8 },
  appCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 14,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    gap: 12,
  },
  appCardActive: { borderColor: 'rgba(0,229,160,0.15)' },
  appIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#111', alignItems: 'center', justifyContent: 'center',
  },
  appIconActive: { backgroundColor: 'rgba(0,229,160,0.08)' },
  appInfo: { flex: 1 },
  appName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  appNameOff: { color: '#444' },
  appPkg: { color: '#333', fontSize: 11, marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#222',
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#1A1A1A', alignItems: 'center',
  },
  modalCancelText: { color: '#888', fontWeight: '600' },
  modalAddBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: GREEN, alignItems: 'center',
  },
  modalAddText: { color: '#000', fontWeight: '700' },
});
