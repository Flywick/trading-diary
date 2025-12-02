import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../context/SettingsContext";

type DayCellProps = {
  dayNumber: number;
  hasTrades: boolean;
  pnl?: number;
  rr?: number;
  onPress: () => void;
  isToday?: boolean; // ✅ nouveau
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

  const getBackgroundColor = () => {
    if (!hasTrades) return theme === "dark" ? "#111827" : "#e5e7eb";
    if ((pnl ?? 0) > 0) return "#16a34a"; // vert
    if ((pnl ?? 0) < 0) return "#dc2626"; // rouge
    return "#2563eb"; // neutre
  };

  const currencySymbol =
    currency === "EUR"
      ? "€"
      : currency === "USD"
      ? "$"
      : currency === "GBP"
      ? "£"
      : currency;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        isToday && styles.todayOutline, // ✅ surbrillance du jour actuel
      ]}
    >
      {/* Ligne du haut : numéro du jour */}
      <View style={styles.topRow}>
        <Text style={styles.dayNumber}>{dayNumber}</Text>
      </View>

      {/* Ligne du bas : PnL et RR */}
      {hasTrades && (
        <View style={styles.bottomRow}>
          <Text
            style={styles.pnlText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {pnl! > 0 ? "+" : ""}
            {pnl?.toFixed(2)} {currencySymbol}
          </Text>
          <Text
            style={styles.rrText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            RR {rr?.toFixed(2) ?? "0.00"}
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

  // ✅ halo autour du jour actuel
  todayOutline: {
    borderWidth: 2,
    borderColor: "#38bdf8", // bleu clair
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
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
  pnlText: {
    color: "#f9fafb",
    fontSize: 11,
    fontWeight: "500",
  },
  rrText: {
    color: "#e5e7eb",
    fontSize: 10,
  },
});

export default DayCell;
