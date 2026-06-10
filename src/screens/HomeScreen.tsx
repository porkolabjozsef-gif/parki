import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendParkingReminder } from '../services/notificationService';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>Par<Text style={styles.accent}>ki</Text></Text>
        <Text style={styles.sub}>Parkolás emlékeztető</Text>
        <TouchableOpacity style={styles.btn} onPress={() => sendParkingReminder('Parkl', 'hu.parkl.android')}>
          <Text style={styles.btnText}>🔔 Teszt értesítés</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  logo: { fontSize: 48, fontWeight: '800', color: '#fff' },
  accent: { color: '#00E5A0' },
  sub: { fontSize: 14, color: '#444' },
  btn: { padding: 16, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
  btnText: { color: '#fff', fontSize: 15 },
});
