// src/billing/iap.ts
import type { Product, Purchase } from "expo-iap";
import * as IAP from "expo-iap";
import { Platform } from "react-native";

/**
 * IDs prévus (consommables)
 * - don_1, don_3, don_5, don_10, don_20, don_50
 */
export const DONATION_PRODUCT_IDS = [
  "don_1",
  "don_3",
  "don_5",
  "don_10",
  "don_20",
  "don_50",
] as const;

export type DonationProductId = (typeof DONATION_PRODUCT_IDS)[number];
export type { Product };

let isConnected = false;

function isUserCancelled(err: any): boolean {
  const code = String(err?.code ?? err?.message ?? "").toUpperCase();
  return code.includes("USER_CANCELLED") || code.includes("E_USER_CANCELLED");
}

export async function iapConnect(): Promise<void> {
  if (isConnected) return;

  const init = (IAP as any).initConnection;
  if (typeof init !== "function") {
    throw new Error(
      "IAP initConnection is not available (requires dev build / store build).",
    );
  }

  await init();
  isConnected = true;
}

export async function iapDisconnect(): Promise<void> {
  if (!isConnected) return;

  const end = (IAP as any).endConnection;
  if (typeof end === "function") {
    await end();
  }
  isConnected = false;
}

/**
 * Récupère les produits (Google Play / App Store).
 * Tant que les produits ne sont pas créés/activés dans la Play Console, ça peut renvoyer [].
 */
export async function fetchDonationProducts(): Promise<Product[]> {
  await iapConnect();

  // expo-iap (récent) expose souvent fetchProducts({ skus, type })
  const fetchProducts = (IAP as any).fetchProducts;
  if (typeof fetchProducts === "function") {
    try {
      const res = await fetchProducts({
        skus: [...DONATION_PRODUCT_IDS],
        type: "in-app",
      });
      return (res ?? []) as Product[];
    } catch {
      // fallback plus bas
    }
  }

  // Fallback anciens noms / signatures
  const legacyFetch =
    (IAP as any).getProducts ||
    (IAP as any).fetchProducts ||
    (IAP as any).getSubscriptions;

  if (typeof legacyFetch !== "function") return [];

  const products = await legacyFetch([...DONATION_PRODUCT_IDS]);
  return (products ?? []) as Product[];
}

export type PurchaseDonationResult = {
  ok: boolean;
  cancelled: boolean;
  message?: string;
};

/**
 * Lance l'achat d'un don (consommable).
 * IMPORTANT : même si c'est un "don", côté store c'est un produit consommable.
 *
 * Note: Le vrai test doit se faire sur une version installée via Google Play (piste de test).
 */
export async function purchaseDonation(
  productId: DonationProductId,
): Promise<PurchaseDonationResult> {
  try {
    await iapConnect();

    const request = (IAP as any).requestPurchase;
    if (typeof request !== "function") {
      return {
        ok: false,
        cancelled: false,
        message: "In-app purchases are not available on this device.",
      };
    }

    // ✅ API expo-iap récente (v2.7+): requestPurchase({ request: { google: { skus: [...] } } })
    // ✅ iOS: sku unique
    // On tente d’abord la forme moderne, puis fallback legacy.
    let purchase: Purchase | null | undefined;

    try {
      purchase = (await request({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
      })) as Purchase | null | undefined;
    } catch (e) {
      // fallback legacy (certaines versions acceptent encore { sku } / string)
      try {
        purchase = (await request({ sku: productId })) as Purchase | null | undefined;
      } catch {
        try {
          purchase = (await request(productId)) as Purchase | null | undefined;
        } catch (finalErr: any) {
          throw finalErr;
        }
      }
    }

    // Sur certains environnements, ça peut retourner null/undefined sans erreur
    if (!purchase) {
      return {
        ok: false,
        cancelled: false,
        message:
          "Purchase could not be started. Please try again in a moment.",
      };
    }

    // Android: consume/acknowledge (consommable)
    const token = (purchase as any)?.purchaseToken as string | undefined;
    const receipt =
      (purchase as any)?.transactionReceipt ??
      (purchase as any)?.originalJson ??
      undefined;

    // Si on n'a aucun token/receipt, on considère que l'achat n'a pas réellement démarré
    if (!token && !receipt) {
      return {
        ok: false,
        cancelled: false,
        message:
          "Purchase could not be confirmed. Please try again later.",
      };
    }

    const ack = (IAP as any).acknowledgePurchaseAndroid;
    const consume = (IAP as any).consumePurchaseAndroid;

    // Pour un consommable Android : consume (et ack en safe)
    if (Platform.OS === "android" && token && typeof ack === "function") {
      await ack({ token }).catch(() => undefined);
    }
    if (Platform.OS === "android" && token && typeof consume === "function") {
      await consume({ token }).catch(() => undefined);
    }

    return { ok: true, cancelled: false };
  } catch (err: any) {
    if (isUserCancelled(err)) return { ok: false, cancelled: true };
    return {
      ok: false,
      cancelled: false,
      message: String(err?.message ?? err),
    };
  }
}
