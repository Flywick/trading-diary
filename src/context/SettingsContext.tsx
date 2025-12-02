import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "JPY";
export type ThemeMode = "dark" | "light";

interface SettingsContextValue {
  currency: CurrencyCode;
  theme: ThemeMode;
  timeFormat24h: boolean;
  setCurrency: (c: CurrencyCode) => void;
  setTheme: (t: ThemeMode) => void;
  setTimeFormat24h: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme: ColorSchemeName = Appearance.getColorScheme();
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [theme, setTheme] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light"
  );
  const [timeFormat24h, setTimeFormat24h] = useState<boolean>(true);

  const value: SettingsContextValue = {
    currency,
    theme,
    timeFormat24h,
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
