import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { Trade, useTrades } from "../context/TradesContext";

const DaySummaryScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { trades, deleteTrade } = useTrades();
  const { theme, currency } = useSettings();
  const router = useRouter();

  const dateStr = typeof date === "string" ? date : "";

  const dayTrades = useMemo(
    () => trades.filter((t) => t.date === dateStr),
    [trades, dateStr]
  );

  const totalPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
  const rrTrades = dayTrades.filter((t) => typeof t.rr === "number");
  const avgRr =
    rrTrades.length > 0
      ? rrTrades.reduce((sum, t) => sum + (t.rr ?? 0), 0) / rrTrades.length
      : 0;

  const jsDate = dateStr ? new Date(dateStr) : new Date();
  const dateLabel = jsDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleAddTrade = () => {
    router.push({ pathname: "/trade", params: { date: dateStr } });
  };

  const handlePressTrade = (trade: Trade) => {
    Alert.alert(
      "Trade",
      "Que veux-tu faire ?",
      [
        {
          text: "Modifier",
          onPress: () => {
            router.push({
              pathname: "/trade",
              params: { date: trade.date, tradeId: trade.id },
            });
          },
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteTrade(trade.id);
          },
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const renderTradeItem = ({ item }: { item: Trade }) => {
    const pnlColor =
      item.pnl > 0 ? "#22c55e" : item.pnl < 0 ? "#ef4444" : "#e5e7eb";

    return (
      <TouchableOpacity onPress={() => handlePressTrade(item)}>
        <View style={styles.tradeCard}>
          <View style={styles.tradeRow}>
            <Text style={styles.instrument}>{item.instrument}</Text>
            <Text
              style={[
                styles.direction,
                item.direction === "BUY" ? styles.buy : styles.sell,
              ]}
            >
              {item.direction}
            </Text>
          </View>

          <View style={styles.tradeRow}>
            <Text style={[styles.pnl, { color: pnlColor }]}>
              {item.pnl > 0 ? "+" : ""}
              {item.pnl.toFixed(2)} {currency}
            </Text>
            {typeof item.rr === "number" && (
              <Text style={styles.rr}>RR {item.rr.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.tradeRow}>
            {item.emotion && (
              <Text style={styles.meta}>Émotion : {item.emotion}</Text>
            )}
            {item.quality && (
              <Text style={styles.meta}>Qualité : {item.quality}</Text>
            )}
            {typeof item.respectPlan === "boolean" && (
              <Text style={styles.meta}>
                Plan {item.respectPlan ? "✅" : "❌"}
              </Text>
            )}
          </View>

          {item.comment && (
            <Text style={styles.comment} numberOfLines={2}>
              {item.comment}
            </Text>
          )}

          {item.screenshotUri && (
            <View style={styles.screenshotRow}>
              <Image
                source={{ uri: item.screenshotUri }}
                style={styles.screenshotThumb}
              />
              <Text style={styles.screenshotLabel}>
                Screenshot enregistré
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#020617" : "#f1f5f9" },
      ]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.summaryText}>
            Résultat total :{" "}
            <Text
              style={{
                color:
                  totalPnl > 0
                    ? "#22c55e"
                    : totalPnl < 0
                    ? "#ef4444"
                    : "#e5e7eb",
              }}
            >
              {totalPnl > 0 ? "+" : ""}
              {totalPnl.toFixed(2)} {currency}
            </Text>
          </Text>
          <Text style={styles.summaryText}>
            RR moyen : {avgRr.toFixed(2)} | Trades : {dayTrades.length}
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddTrade}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {dayTrades.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aucun trade ce jour. Appuie sur "+" pour ajouter un trade.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dayTrades}
          keyExtractor={(item) => item.id}
          renderItem={renderTradeItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8, // petite marge sous la barre de notif
    marginBottom: 12,
  },
  headerTextBlock: {
    flex: 1,
  },
  dateLabel: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  summaryText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addButtonText: {
    color: "#e5e7eb",
    fontSize: 22,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
  },
  tradeCard: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#111827",
  },
  tradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  instrument: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
  },
  direction: {
    fontSize: 13,
    fontWeight: "700",
  },
  buy: {
    color: "#22c55e",
  },
  sell: {
    color: "#ef4444",
  },
  pnl: {
    fontSize: 14,
    fontWeight: "600",
  },
  rr: {
    color: "#9ca3af",
    fontSize: 12,
  },
  meta: {
    color: "#9ca3af",
    fontSize: 11,
    marginRight: 8,
  },
  comment: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  screenshotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  screenshotThumb: {
    width: 60,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#111827",
    marginRight: 8,
  },
  screenshotLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
});

export default DaySummaryScreen;
