import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>Par<Text style={styles.accent}>ki</Text></Text>
        <Text style={styles.sub}>Parkolás emlékeztető</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 48, fontWeight: '800', color: '#fff' },
  accent: { color: '#00E5A0' },
  sub: { fontSize: 14, color: '#444', marginTop: 8 },
});
