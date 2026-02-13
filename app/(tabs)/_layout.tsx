// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../../src/context/SettingsContext";
import { useI18n } from "../../src/i18n/useI18n";

// ⚠️ Mets ici TES chemins exacts (ceux qui marchent chez toi)
const ICONS = {
  agenda: {
    light: require("../../assets/images/agenda-light.png"),
    dark: require("../../assets/images/agenda-dark.png"),
  },
  stats: {
    light: require("../../assets/images/stats-light.png"),
    dark: require("../../assets/images/stats-dark.png"),
  },
  settings: {
    light: require("../../assets/images/settings-light.png"),
    dark: require("../../assets/images/settings-dark.png"),
  },
};

type TabIconProps = {
  name: keyof typeof ICONS;
  size?: number;
  theme: "light" | "dark";
};

function TabIcon({ name, size = 22, theme }: TabIconProps) {
  const source = theme === "dark" ? ICONS[name].dark : ICONS[name].light;

  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
      }}
    />
  );
}

export default function TabsLayout() {
  const { theme } = useSettings();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const isDark = theme === "dark";

  const tabBarBackground = isDark ? "#020617" : "#F8FAFC";
  const tabBarBorder = isDark ? "#0F172A" : "#E2E8F0";

  const activeTint = "#00ED69";
  const inactiveTint = isDark ? "#94A3B8" : "#64748B";

  const baseHeight = 64;
  const extraBottom = Math.max(insets.bottom, 8); // garde un mini padding même si 0

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ✅ Empêche le contenu d'aller sous la status bar (notch / notifications)
        sceneStyle: {
          backgroundColor: isDark ? "#020617" : "#F8FAFC",
        },

        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,

          height: baseHeight + extraBottom,
          paddingTop: 8,
          paddingBottom: extraBottom,
        },

        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,

        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },

        // (Optionnel mais agréable) cache la tabbar quand clavier ouvert
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("agenda.title"),
          tabBarIcon: ({ size }) => (
            <TabIcon name="agenda" size={size ?? 22} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: t("stats.title"),
          tabBarIcon: ({ size }) => (
            <TabIcon name="stats" size={size ?? 22} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ size }) => (
            <TabIcon name="settings" size={size ?? 22} theme={theme} />
          ),
        }}
      />
    </Tabs>
  );
}
