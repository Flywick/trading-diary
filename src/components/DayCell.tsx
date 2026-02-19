import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../context/SettingsContext";

type DayCellProps = {
  dayNumber: number;
  hasTrades: boolean;
  pnl?: number;
  rr?: number;
  onPress: () => void;
  isToday?: boolean;
};

const DayCell: React.FC<DayCellProps> = ({
  dayNumber,
  hasTrades,
  pnl,
  rr,
  onPress,
  isToday = false,
}) => {
  const { theme, currency } = useSettings();
  const isDark = theme === "dark";

  const getBackgroundColor = () => {
    if (!hasTrades) {
      // Cellule neutre (sans trades)
      return isDark ? "#111827" : "#e5e7eb";
    }
    if ((pnl ?? 0) > 0) return "#16a34a"; // vert
    if ((pnl ?? 0) < 0) return "#dc2626"; // rouge
    return "#2563eb"; // neutre (PnL = 0)
  };

  const currencySymbol =
    currency === "EUR"
      ? "€"
      : currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : currency === "JPY"
            ? "¥"
            : currency;

  // Couleurs de texte : plus contrastées en mode clair sur les cases grises
  const dayNumberColor = hasTrades ? "#f9fafb" : isDark ? "#e5e7eb" : "#0f172a";

  const pnlTextColor = hasTrades ? "#f9fafb" : isDark ? "#e5e7eb" : "#0f172a";

  const rrTextColor = hasTrades ? "#e5e7eb" : isDark ? "#9ca3af" : "#6b7280";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        isToday && styles.todayOutline,
      ]}
    >
      {/* Ligne du haut : numéro du jour */}
      <View style={styles.topRow}>
        <Text style={[styles.dayNumber, { color: dayNumberColor }]}>
          {dayNumber}
        </Text>
      </View>

      {/* Ligne du bas : PnL et RR si trades */}
      {hasTrades && (
        <View style={styles.bottomRow}>
          <Text
            style={[styles.pnlText, { color: pnlTextColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {pnl! > 0 ? "+" : ""}
            {pnl?.toFixed(2)} {currencySymbol}
          </Text>
          <Text style={[styles.rrText, { color: rrTextColor }]}>
            RR {typeof rr === "number" && Number.isFinite(rr) ? String(Math.round(rr)) : "0"}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 6,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  todayOutline: {
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  topRow: {
    width: "100%",
    alignItems: "flex-start",
  },
  bottomRow: {
    width: "100%",
    alignItems: "flex-start",
  },
  dayNumber: {
    fontWeight: "700",
    fontSize: 14,
  },
  pnlText: {
    fontSize: 11,
    fontWeight: "500",
  },
  rrText: {
    fontSize: 10,
  },
});

export default DayCell;
