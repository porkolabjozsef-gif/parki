import React from 'react';
import { Alert, Linking, Platform, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../services/languageContext';

interface Props {
  lat: number;
  lng: number;
  label?: string;
  elapsedStr?: string;
}

export default function ParkingMap({ lat, lng, label, elapsedStr }: Props) {
  const { t } = useLanguage();

  const openInMaps = () => {
    Alert.alert(t('openInMaps'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('open'),
        onPress: () => {
          const geoUrl = Platform.select({
            android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label || 'Parking')})`,
            ios: `maps:0,0?q=${lat},${lng}`,
            default: `geo:${lat},${lng}`,
          });
          Linking.openURL(geoUrl!).catch(() => {});
        },
      },
    ]);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #0D0D0D; }
    .leaflet-control-attribution { font-size: 7px; opacity: 0.4; }
    .pin-wrap {
      width: 30px; height: 42px; cursor: pointer;
      display: flex; align-items: flex-start; justify-content: center;
    }
    .pin-drop {
      width: 30px; height: 30px;
      background: #1A6BFF; border: 3px solid #fff;
      border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OSM'
    }).addTo(map);
    var icon = L.divIcon({
      className: '',
      html: '<div class="pin-wrap"><div class="pin-drop"></div></div>',
      iconSize: [30, 42], iconAnchor: [15, 42]
    });
    var marker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
    marker.on('click', function() { window.ReactNativeWebView.postMessage('pin-click'); });
  </script>
</body>
</html>`;

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={(e) => { if (e.nativeEvent.data === 'pin-click') openInMaps(); }}
        javaScriptEnabled
        domStorageEnabled
      />
      {elapsedStr ? (
        <View style={styles.timeOverlay} pointerEvents="none">
          <Text style={styles.timeText}>🅿️ {elapsedStr}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0D0D0D' },
  webview: { flex: 1, backgroundColor: '#0D0D0D' },
  timeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 10,
    alignItems: 'center',
  },
  timeText: { color: '#fff', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
