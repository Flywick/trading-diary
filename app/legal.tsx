// app/legal.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../src/context/SettingsContext";
import { useI18n } from "../src/i18n/useI18n";

const LegalScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useSettings();
  const { t } = useI18n();

  const isDark = theme === "dark";
  const screenBg = isDark ? "#020617" : "#e5e7eb";
  const cardBg = isDark ? "#020617" : "#ffffff";
  const cardBorder = isDark ? "#111827" : "#d1d5db";
  const mainText = isDark ? "#e5e7eb" : "#0f172a";
  const subText = isDark ? "#9ca3af" : "#6b7280";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: screenBg }]}
      edges={["top"]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: screenBg }]}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 32,
        }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { borderColor: isDark ? "#4b5563" : "#cbd5e1" },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backText, { color: subText }]}>
              {t("common.close")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: mainText }]}>
          {t("legal.title")}
        </Text>
        <Text style={[styles.subtitle, { color: subText }]}>
          {t("legal.lastUpdated")}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          {/* Privacy */}
          <Text style={[styles.sectionTitle, { color: mainText }]}>
            {t("legal.privacyTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.privacyBody")}
          </Text>

          {/* Data security */}
          <Text
            style={[styles.sectionTitle, { color: mainText, marginTop: 14 }]}
          >
            {t("legal.dataSecurityTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.dataSecurityBody")}
          </Text>

          {/* Terms */}
          <Text
            style={[styles.sectionTitle, { color: mainText, marginTop: 14 }]}
          >
            {t("legal.termsTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.termsBody")}
          </Text>

          {/* Donations */}
          <Text
            style={[styles.sectionTitle, { color: mainText, marginTop: 14 }]}
          >
            {t("legal.donationTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.donationBody")}
          </Text>

          {/* Liability */}
          <Text
            style={[styles.sectionTitle, { color: mainText, marginTop: 14 }]}
          >
            {t("legal.liabilityTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.liabilityBody")}
          </Text>

          {/* Contact */}
          <Text
            style={[styles.sectionTitle, { color: mainText, marginTop: 14 }]}
          >
            {t("legal.contactTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: subText }]}>
            {t("legal.contactBody")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: { fontSize: 12, fontWeight: "500" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 12 },
  card: { borderRadius: 12, padding: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  paragraph: { fontSize: 13, lineHeight: 18 },
});

export default LegalScreen;
