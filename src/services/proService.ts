import AsyncStorage from '@react-native-async-storage/async-storage';
import { initConnection, fetchProducts, requestPurchase, getAvailablePurchases, purchaseUpdatedListener, purchaseErrorListener, finishTransaction, OpenIapEvent } from 'expo-iap';

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
  return new Promise(async (resolve, reject) => {
    try {
      await initConnection();
      const products = await fetchProducts({ skus: [PRODUCT_ID], type: 'in-app' });
      if (!products.length) throw new Error('Termék nem található');

      const purchaseUpdate = purchaseUpdatedListener(async (purchase) => {
        purchaseUpdate.remove();
        purchaseError.remove();
        await finishTransaction({ purchase, isConsumable: false });
        await AsyncStorage.setItem(PRO_KEY, 'true');
        resolve(true);
      });

      const purchaseError = purchaseErrorListener((error) => {
        purchaseUpdate.remove();
        purchaseError.remove();
        if (error.code === 'E_USER_CANCELLED') resolve(false);
        else reject(error);
      });

      await requestPurchase({
        request: {
          google: { skus: [PRODUCT_ID] },
        },
        type: 'in-app',
      });
    } catch (e: any) {
      if (e.code === 'E_USER_CANCELLED') resolve(false);
      else reject(e);
    }
  });
}

export async function restorePro(): Promise<boolean> {
  try {
    await initConnection();
    const purchases = await getAvailablePurchases();
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
