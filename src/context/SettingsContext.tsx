// src/context/SettingsContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "JPY";
export type ThemeMode = "dark" | "light";

interface SettingsContextValue {
  currency: CurrencyCode;
  theme: ThemeMode;
  timeFormat24h: boolean;
  isSettingsLoaded: boolean;
  setCurrency: (c: CurrencyCode) => void;
  setTheme: (t: ThemeMode) => void;
  setTimeFormat24h: (v: boolean) => void;
}

const STORAGE_KEY = "@trading-diary-settings-v1";

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme: ColorSchemeName = Appearance.getColorScheme();

  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [theme, setTheme] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );
  const [timeFormat24h, setTimeFormat24h] = useState<boolean>(true);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // 🔹 Chargement initial (ANTI-FLASH)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);

          if (parsed.theme === "dark" || parsed.theme === "light") {
            setTheme(parsed.theme);
          }

          if (
            parsed.currency === "EUR" ||
            parsed.currency === "USD" ||
            parsed.currency === "GBP" ||
            parsed.currency === "JPY"
          ) {
            setCurrency(parsed.currency);
          }

          if (typeof parsed.timeFormat24h === "boolean") {
            setTimeFormat24h(parsed.timeFormat24h);
          }
        }
      } catch (e) {
        console.warn("Failed to load settings", e);
      } finally {
        setIsSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // 🔹 Persistance automatique
  useEffect(() => {
    if (!isSettingsLoaded) return;

    const persist = async () => {
      try {
        const payload = {
          theme,
          currency,
          timeFormat24h,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn("Failed to persist settings", e);
      }
    };

    persist();
  }, [theme, currency, timeFormat24h, isSettingsLoaded]);

  const value: SettingsContextValue = {
    currency,
    theme,
    timeFormat24h,
    isSettingsLoaded,
    setCurrency,
    setTheme,
    setTimeFormat24h,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
};
