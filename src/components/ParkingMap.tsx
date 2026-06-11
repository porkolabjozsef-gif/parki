import React from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../services/languageContext';

interface Props {
  lat: number;
  lng: number;
  label?: string;
}

export default function ParkingMap({ lat, lng, label }: Props) {
  const { t } = useLanguage();

  const openInMaps = () => {
    Alert.alert(
      t('openInMaps'),
      '',
      [
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
      ]
    );
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
    .leaflet-control-attribution { font-size: 8px; opacity: 0.5; }
    .parking-pin {
      background: #FF9500; width: 20px; height: 20px; border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      cursor: pointer;
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
    var icon = L.divIcon({ className: '', html: '<div class="parking-pin"></div>', iconSize: [20,20], iconAnchor: [10,20] });
    var marker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
    marker.on('click', function() {
      window.ReactNativeWebView.postMessage('pin-click');
    });
  </script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1, backgroundColor: '#0D0D0D' }}
      scrollEnabled={false}
      onMessage={(event) => {
        if (event.nativeEvent.data === 'pin-click') openInMaps();
      }}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}
