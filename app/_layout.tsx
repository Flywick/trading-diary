// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AccountProvider } from "../src/context/AccountContext";
import { JournalProvider } from "../src/context/JournalContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import { SettingsProvider, useSettings } from "../src/context/SettingsContext";
import { TradesProvider } from "../src/context/TradesContext";

function RootNavigator() {
  const { theme } = useSettings();
  const navTheme = theme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SettingsProvider>
          <AccountProvider>
            <JournalProvider>
              <TradesProvider>
                <RootNavigator />
              </TradesProvider>
            </JournalProvider>
          </AccountProvider>
        </SettingsProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
