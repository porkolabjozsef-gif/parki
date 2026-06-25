import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoIAP from 'expo-iap';

const PRO_KEY = 'parki_pro_purchased';
const PRODUCT_ID = 'pro';

export async function isProUser(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(PRO_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function purchasePro(): Promise<boolean> {
  try {
    await ExpoIAP.connectAsync();
    const products = await ExpoIAP.getProductsAsync([PRODUCT_ID]);
    if (!products.length) throw new Error('Termék nem található');
    await ExpoIAP.purchaseItemAsync(PRODUCT_ID);
    await AsyncStorage.setItem(PRO_KEY, 'true');
    return true;
  } catch (e: any) {
    if (e.code === 'E_USER_CANCELLED') return false;
    throw e;
  }
}

export async function restorePro(): Promise<boolean> {
  try {
    await ExpoIAP.connectAsync();
    const purchases = await ExpoIAP.getPurchaseHistoryAsync();
    const hasPro = purchases.some((p: any) => p.productId === PRODUCT_ID);
    if (hasPro) {
      await AsyncStorage.setItem(PRO_KEY, 'true');
    }
    return hasPro;
  } catch {
    return false;
  }
}

export async function setPro(val: boolean) {
  await AsyncStorage.setItem(PRO_KEY, val ? 'true' : 'false');
}
