import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

const PRO_KEY = 'parki_pro_purchased';
const PRODUCT_ID = 'pro_upgrade';

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
    await RNIap.initConnection();
    const products = await RNIap.getProducts({ skus: [PRODUCT_ID] });
    if (!products.length) return false;
    await RNIap.requestPurchase({ sku: PRODUCT_ID });
    return true;
  } catch (e: any) {
    if (e.code === 'E_USER_CANCELLED') return false;
    throw e;
  }
}

export async function restorePro(): Promise<boolean> {
  try {
    await RNIap.initConnection();
    const purchases = await RNIap.getAvailablePurchases();
    const hasPro = purchases.some(p => p.productId === PRODUCT_ID);
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
