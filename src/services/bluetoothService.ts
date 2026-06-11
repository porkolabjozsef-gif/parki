import RNBluetoothClassic, { BluetoothEventType } from 'react-native-bluetooth-classic';
import { getActiveParking, clearActiveParking } from './monitorService';
import * as Notifications from 'expo-notifications';

// Az autó BT eszköz neve/címe — a Beállításokban konfigurálható
let carDeviceName: string | null = null;

export function setCarDeviceName(name: string | null) {
  carDeviceName = name;
}

export function getCarDeviceName(): string | null {
  return carDeviceName;
}

let connectedSub: any = null;
let disconnectedSub: any = null;

export function startBluetoothMonitor() {
  stopBluetoothMonitor();

  connectedSub = RNBluetoothClassic.onDeviceConnected(async (event) => {
    if (!carDeviceName) return;
    const name = event.device?.name || '';
    if (!name.toLowerCase().includes(carDeviceName.toLowerCase())) return;

    // Autó BT csatlakozva → figyelmeztető értesítés ha aktív parkolás van
    const parking = await getActiveParking();
    if (!parking) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Beültél az autóba?',
        body: `${parking.appName} parkolás még aktív! Állítsd le ha indulsz.`,
      },
      trigger: null,
    });
  });

  disconnectedSub = RNBluetoothClassic.onDeviceDisconnected(async (event) => {
    if (!carDeviceName) return;
    const name = event.device?.name || '';
    if (!name.toLowerCase().includes(carDeviceName.toLowerCase())) return;

    // Autó BT lecsatlakozott — geofence már kezeli a leállítást
    // (dupla feltétel: BT + geofence együtt a monitorService-ben)
  });
}

export function stopBluetoothMonitor() {
  connectedSub?.remove();
  disconnectedSub?.remove();
  connectedSub = null;
  disconnectedSub = null;
}
