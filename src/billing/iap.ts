// src/billing/iap.ts
import type { Product, Purchase } from "expo-iap";
import * as IAP from "expo-iap";
import { Platform } from "react-native";

/**
 * IDs (consommables)
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

export type PurchaseDonationResult = {
  ok: boolean;
  cancelled: boolean;
  message?: string;
  code?: string;
};

let isConnected = false;
let didAndroidPendingFlush = false;

let purchaseUpdateSub: any = null;
let purchaseErrorSub: any = null;

// One in-flight purchase promise at a time (simple + robust for V1).
let inflightResolve: ((v: PurchaseDonationResult) => void) | null = null;
let inflightProductId: DonationProductId | null = null;
let inflightTimer: any = null;

function clearInflight() {
  if (inflightTimer) {
    clearTimeout(inflightTimer);
    inflightTimer = null;
  }
  inflightResolve = null;
  inflightProductId = null;
}

function isUserCancelled(err: any): boolean {
  const code = String(err?.code ?? err?.message ?? "").toUpperCase();
  return code.includes("USER_CANCELLED") || code.includes("E_USER_CANCELLED");
}

async function flushPendingAndroidIfNeeded(): Promise<void> {
  if (Platform.OS !== "android") return;
  if (didAndroidPendingFlush) return;

  const flush = (IAP as any).flushFailedPurchasesCachedAsPendingAndroid;
  if (typeof flush === "function") {
    try {
      await flush();
    } catch {
      // ignore
    }
  }

  didAndroidPendingFlush = true;
}

async function consumeOwnedDonationsAndroid(): Promise<void> {
  if (Platform.OS !== "android") return;

  const getAvailable = (IAP as any).getAvailablePurchases;
  const consume = (IAP as any).consumePurchaseAndroid;
  const ack = (IAP as any).acknowledgePurchaseAndroid;

  if (typeof getAvailable !== "function") return;
  if (typeof consume !== "function") return;

  let purchases: any[] = [];
  try {
    purchases = (await getAvailable()) ?? [];
  } catch {
    return;
  }

  for (const p of purchases) {
    const pid = String(p?.productId ?? p?.sku ?? "");
    if (!pid) continue;
    if (!(DONATION_PRODUCT_IDS as readonly string[]).includes(pid)) continue;

    const token = p?.purchaseToken as string | undefined;
    if (!token) continue;

    if (typeof ack === "function") {
      try {
        await ack({ token });
      } catch {
        // ignore
      }
    }

    try {
      await consume({ token });
    } catch {
      // ignore
    }
  }
}

async function finalizeAndroidConsumable(purchase: any): Promise<void> {
  const token =
    (purchase as any)?.purchaseToken ??
    (purchase as any)?.purchase?.purchaseToken ??
    (purchase as any)?.token;

  const ack = (IAP as any).acknowledgePurchaseAndroid;
  const consume = (IAP as any).consumePurchaseAndroid;

  if (Platform.OS === "android" && token) {
    if (typeof ack === "function") {
      await ack({ token }).catch(() => undefined);
    }
    if (typeof consume === "function") {
      await consume({ token }).catch(() => undefined);
    }
  }
}

function ensureListeners() {
  if (purchaseUpdateSub || purchaseErrorSub) return;

  const purchaseUpdatedListener = (IAP as any).purchaseUpdatedListener;
  const purchaseErrorListener = (IAP as any).purchaseErrorListener;
  const finishTransaction = (IAP as any).finishTransaction;

  if (typeof purchaseUpdatedListener === "function") {
    purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        const pid = String(
          (purchase as any)?.productId ?? (purchase as any)?.sku ?? "",
        );

        const shouldResolve =
          !!inflightResolve &&
          !!inflightProductId &&
          pid === inflightProductId;

        // Finalize/consume even if not matching (safe), but only resolve if matching.
        if (typeof finishTransaction === "function") {
          try {
            await finishTransaction({ purchase, isConsumable: true });
          } catch {
            // ignore
          }
        }
        await finalizeAndroidConsumable(purchase);

        if (shouldResolve && inflightResolve) {
          inflightResolve({ ok: true, cancelled: false });
          clearInflight();
        }
      } catch (e: any) {
        if (inflightResolve) {
          inflightResolve({
            ok: false,
            cancelled: false,
            message: String(e?.message ?? e),
          });
          clearInflight();
        }
      }
    });
  }

  if (typeof purchaseErrorListener === "function") {
    purchaseErrorSub = purchaseErrorListener((err: any) => {
      if (!inflightResolve) return;

      if (isUserCancelled(err)) {
        inflightResolve({ ok: false, cancelled: true });
        clearInflight();
        return;
      }

      inflightResolve({
        ok: false,
        cancelled: false,
        code: String(err?.code ?? ""),
        message: String(err?.message ?? err),
      });
      clearInflight();
    });
  }
}

export async function iapConnect(): Promise<void> {
  if (isConnected) return;

  const init = (IAP as any).initConnection;
  if (typeof init !== "function") {
    throw new Error("IAP initConnection is not available.");
  }

  await init();
  isConnected = true;

  await flushPendingAndroidIfNeeded();
  ensureListeners();
}

export async function iapDisconnect(): Promise<void> {
  if (!isConnected) return;

  try {
    if (purchaseUpdateSub?.remove) purchaseUpdateSub.remove();
    if (purchaseErrorSub?.remove) purchaseErrorSub.remove();
  } catch {
    // ignore
  } finally {
    purchaseUpdateSub = null;
    purchaseErrorSub = null;
  }

  const end = (IAP as any).endConnection;
  if (typeof end === "function") {
    await end().catch(() => undefined);
  }
  isConnected = false;
  clearInflight();
}

/**
 * Fetch donation products
 */
export async function fetchDonationProducts(): Promise<Product[]> {
  await iapConnect();

  const fetchProducts = (IAP as any).fetchProducts;
  if (typeof fetchProducts === "function") {
    try {
      const res = await fetchProducts({
        skus: [...DONATION_PRODUCT_IDS],
        type: "in-app",
      });
      return (res ?? []) as Product[];
    } catch {
      // fallback below
    }
  }

  const legacyFetch =
    (IAP as any).getProducts ||
    (IAP as any).fetchProducts ||
    (IAP as any).getSubscriptions;

  if (typeof legacyFetch !== "function") return [];

  const products = await legacyFetch([...DONATION_PRODUCT_IDS]);
  return (products ?? []) as Product[];
}

/**
 * Purchase a donation
 *
 * IMPORTANT:
 * With Google Play Billing, the reliable success signal comes from purchaseUpdatedListener.
 * requestPurchase() may return before the purchase is finalized, so we wait for the listener.
 */
export async function purchaseDonation(
  productId: DonationProductId,
): Promise<PurchaseDonationResult> {
  await iapConnect();

  // Avoid "already owned" by consuming any owned donations before starting.
  await consumeOwnedDonationsAndroid();

  if (inflightResolve) {
    return {
      ok: false,
      cancelled: false,
      message: "Another purchase is already in progress. Please try again.",
    };
  }

  const request = (IAP as any).requestPurchase;
  if (typeof request !== "function") {
    return {
      ok: false,
      cancelled: false,
      message: "In-app purchases are not available on this device.",
    };
  }

  // Create a promise resolved by listeners.
  const resultPromise = new Promise<PurchaseDonationResult>((resolve) => {
    inflightResolve = resolve;
    inflightProductId = productId;

    // Safety timeout to avoid hanging forever if Play doesn't callback
    inflightTimer = setTimeout(() => {
      if (!inflightResolve) return;
      inflightResolve({
        ok: false,
        cancelled: false,
        message: "Purchase timeout. Please try again.",
      });
      clearInflight();
    }, 30000);
  });

  // Start purchase (do not depend on returned value for confirmation).
  try {
    // Modern signature first
    try {
      await request({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
      });
    } catch {
      // Legacy fallback
      try {
        await request({ sku: productId });
      } catch {
        await request(productId);
      }
    }
  } catch (err: any) {
    // If start itself fails, resolve immediately
    if (inflightResolve) {
      if (isUserCancelled(err)) {
        inflightResolve({ ok: false, cancelled: true });
      } else {
        inflightResolve({
          ok: false,
          cancelled: false,
          code: String(err?.code ?? ""),
          message: String(err?.message ?? err),
        });
      }
      clearInflight();
    }
  }

  return await resultPromise;
}
