import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Note: Install lottie-react-native for the full animation
// npm install lottie-react-native
// For now using a CSS/Animated fallback

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const goldCoinY = useRef(new Animated.Value(-120)).current;
  const silverCoinY = useRef(new Animated.Value(-120)).current;
  const bronzeCoinY = useRef(new Animated.Value(-120)).current;
  const goldCoinO = useRef(new Animated.Value(0)).current;
  const silverCoinO = useRef(new Animated.Value(0)).current;
  const bronzeCoinO = useRef(new Animated.Value(0)).current;
  const walletScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Wallet appears
    Animated.spring(walletScale, {
      toValue: 1,
      delay: 200,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Gold coin drops
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(goldCoinO, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(goldCoinY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 6 }),
      ]),
      Animated.delay(150),
      Animated.timing(goldCoinO, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Silver coin drops
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(silverCoinO, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(silverCoinY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 6 }),
      ]),
      Animated.delay(150),
      Animated.timing(silverCoinO, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Bronze coin drops
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(bronzeCoinO, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(bronzeCoinY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 6 }),
      ]),
      Animated.delay(150),
      Animated.timing(bronzeCoinO, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    // Text fades in
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 400,
      delay: 1200,
      useNativeDriver: true,
    }).start();

    // Fade out and finish
    Animated.sequence([
      Animated.delay(2200),
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.center}>

        {/* Gold coin */}
        <Animated.View style={[
          styles.coin, styles.goldCoin,
          { opacity: goldCoinO, transform: [{ translateY: goldCoinY }, { translateX: -20 }] }
        ]}>
          <Text style={styles.coinText}>€</Text>
        </Animated.View>

        {/* Silver coin */}
        <Animated.View style={[
          styles.coin, styles.silverCoin,
          { opacity: silverCoinO, transform: [{ translateY: silverCoinY }, { translateX: 10 }] }
        ]}>
          <Text style={styles.coinText}>€</Text>
        </Animated.View>

        {/* Bronze coin */}
        <Animated.View style={[
          styles.coin, styles.bronzeCoin,
          { opacity: bronzeCoinO, transform: [{ translateY: bronzeCoinY }, { translateX: 25 }] }
        ]}>
          <Text style={styles.coinText}>€</Text>
        </Animated.View>

        {/* Wallet */}
        <Animated.View style={[styles.wallet, { transform: [{ scale: walletScale }] }]}>
          {/* Wallet flap */}
          <View style={styles.walletFlap}>
            <View style={styles.coinSlot} />
          </View>
          {/* Wallet body */}
          <View style={styles.walletBody} />
        </Animated.View>

        {/* Parki text */}
        <Animated.Text style={[styles.logo, { opacity: textOpacity }]}>
          Par<Text style={styles.logoAccent}>ki</Text>
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
          Ne fizessen feleslegesen
        </Animated.Text>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%',
    zIndex: 10,
  },
  goldCoin: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  silverCoin: {
    backgroundColor: '#C0C0C0',
    borderWidth: 2,
    borderColor: '#888888',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bronzeCoin: {
    backgroundColor: '#CD7F32',
    borderWidth: 2,
    borderColor: '#8B5A1A',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  coinText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  wallet: {
    alignItems: 'center',
    marginBottom: 48,
  },
  walletFlap: {
    width: 160,
    height: 32,
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  coinSlot: {
    width: 52,
    height: 8,
    backgroundColor: '#5A4000',
    borderRadius: 4,
  },
  walletBody: {
    width: 160,
    height: 100,
    backgroundColor: '#3A2800',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderTopWidth: 0,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 32,
  },
  logoAccent: {
    color: '#00E5A0',
  },
  tagline: {
    fontSize: 14,
    color: '#444444',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
