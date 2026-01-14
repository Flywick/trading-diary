// src/config/features.ts
// Central feature flags to keep V1 minimal and re-enable features for V2 easily.

export type AppReleaseChannel = "v1" | "v2";

// Change this when you ship V2.
export const RELEASE_CHANNEL: AppReleaseChannel = "v1";

export const FEATURES = {
  // V1: single journal experience (hide multi-profiles UI)
  MULTI_PROFILES: RELEASE_CHANNEL === "v2",

  // V1: remove CSV export surface
  EXPORT_CSV: RELEASE_CHANNEL === "v2",

  // V1: remove equity curve (SVG/chart)
  EQUITY_CURVE: RELEASE_CHANNEL === "v2",

  // V1: remove camera/gallery screenshot to avoid sensitive permissions
  TRADE_SCREENSHOT: RELEASE_CHANNEL === "v2",
} as const;
