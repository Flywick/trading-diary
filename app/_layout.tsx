import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { JournalProvider } from "@/src/context/JournalContext";
import { AccountProvider } from "../src/context/AccountContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import { TradesProvider } from "../src/context/TradesContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <LanguageProvider>
      <SettingsProvider>
        <AccountProvider>
          <JournalProvider>
            <TradesProvider>
              <ThemeProvider value={navTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </TradesProvider>
          </JournalProvider>
        </AccountProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}
