// src/config/features.ts
// Central feature flags to keep V1 minimal and re-enable features for V2 easily.

export const FEATURES = {
  MULTI_PROFILES: false,
  EXPORT_CSV: false,
  EQUITY_CURVE: false,
  TRADE_SCREENSHOT: false,
} as const;
