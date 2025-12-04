// src/screens/AgendaScreen.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DayCell from "../components/DayCell";
import { useJournal } from "../context/JournalContext";
import { useSettings } from "../context/SettingsContext";
import { useTrades } from "../context/TradesContext";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_MARGIN = 6;
const NUM_COLUMNS = 7;
const CELL_SIZE =
  (SCREEN_WIDTH - CELL_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const CELL_HEIGHT = CELL_SIZE * 1.15;

function getDaysMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix: (number | null)[][] = [];
  let currentDay = 1 - startWeekday;

  for (let row = 0; row < 6; row++) {
    const week: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null);
      } else {
        week.push(currentDay);
      }
      currentDay++;
    }
    matrix.push(week);
  }

  return matrix;
}

const AgendaScreen: React.FC = () => {
  const { trades } = useTrades();
  const { theme, currency } = useSettings();
  const isDark = theme === "dark";

  // Couleurs dépendantes du thème
  const bgColor = isDark ? "#020617" : "#f1f5f9";
  const monthSummaryBg = isDark ? "#020617" : "#e5e7eb";
  const headerTitleColor = isDark ? "#e5e7eb" : "#0f172a";
  const arrowColor = isDark ? "#e5e7eb" : "#0f172a";
  const journalLabelColor = isDark ? "#9ca3af" : "#6b7280";
  const journalChipBg = isDark ? "#020617" : "#ffffff";
  const journalChipBorder = isDark ? "#4b5563" : "#cbd5e1";
  const journalChipTextColor = isDark ? "#e5e7eb" : "#0f172a";
  const summaryLabelColor = isDark ? "#9ca3af" : "#6b7280";
  const summarySubColor = isDark ? "#9ca3af" : "#6b7280";
  const weekdayColor = isDark ? "#9ca3af" : "#64748b";

  const modalCardBg = isDark ? "#020617" : "#ffffff";
  const modalCardBorder = isDark ? "#111827" : "#e5e7eb";
  const modalTitleColor = isDark ? "#e5e7eb" : "#0f172a";
  const modalLabelColor = isDark ? "#9ca3af" : "#6b7280";
  const modalInputBg = isDark ? "#020617" : "#f9fafb";
  const modalInputBorder = isDark ? "#111827" : "#d1d5db";
  const modalInputTextColor = isDark ? "#e5e7eb" : "#0f172a";

  const journalItemBorder = isDark ? "#1f2933" : "#cbd5e1";
  const journalItemBg = isDark ? "#020617" : "#ffffff";
  const journalItemBgActive = isDark ? "#0b1120" : "#e0f2fe";
  const journalItemTextColor = isDark ? "#e5e7eb" : "#0f172a";
  const journalItemTextActiveColor = isDark ? "#e5e7eb" : "#0f172a";

  const {
    journals,
    activeJournal,
    createJournal,
    renameJournal,
    setActiveJournal,
  } = useJournal();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");
  const [renameValue, setRenameValue] = useState(activeJournal?.name ?? "");

  const monthAnim = useRef(new Animated.Value(1)).current;

  const animateMonthChange = (newDate: Date) => {
    monthAnim.setValue(0);
    setCurrentDate(newDate);
    Animated.timing(monthAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const daysMatrix = useMemo(() => getDaysMatrix(year, month), [year, month]);

  const monthStats = useMemo(() => {
    const monthTrades = trades.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const tradeCount = monthTrades.length;
    const totalPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winningTrades = monthTrades.filter((t) => t.pnl > 0).length;
    const winrate =
      tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;

    return {
      tradeCount,
      totalPnl,
      winrate,
    };
  }, [trades, year, month]);

  const getSummaryForDay = (dayNumber: number) => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(dayNumber).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayTrades = trades.filter((t) => t.date === dateStr);
    if (dayTrades.length === 0) {
      return { hasTrades: false, pnl: 0, rr: 0, dateStr };
    }

    const totalPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    const rrTrades = dayTrades.filter((t) => typeof t.rr === "number");
    const avgRr =
      rrTrades.length > 0
        ? rrTrades.reduce((sum, t) => sum + (t.rr ?? 0), 0) /
          rrTrades.length
        : 0;

    return {
      hasTrades: true,
      pnl: totalPnl,
      rr: avgRr,
      dateStr,
    };
  };

  const monthName = currentDate.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth = direction === "prev" ? month - 1 : month + 1;
    const newDate = new Date(year, newMonth, 1);
    animateMonthChange(newDate);
  };

  const goToToday = () => {
    const now = new Date();
    const newDate = new Date(now.getFullYear(), now.getMonth(), 1);
    animateMonthChange(newDate);
  };

  const animatedContentStyle = {
    opacity: monthAnim,
    transform: [
      {
        translateY: monthAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const openJournalModal = () => {
    setNewJournalName("");
    setRenameValue(activeJournal?.name ?? "");
    setJournalModalVisible(true);
  };

  const closeJournalModal = () => {
    setJournalModalVisible(false);
  };

  const handleDayPress = (dayNumber: number) => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(dayNumber).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayTrades = trades.filter((t) => t.date === dateStr);
    const hasTrades = dayTrades.length > 0;

    if (hasTrades) {
      router.push({ pathname: "/day", params: { date: dateStr } });
    } else {
      router.push({ pathname: "/trade", params: { date: dateStr } });
    }
  };

  const handleCreateJournal = () => {
    const name = newJournalName.trim() || "Nouveau journal";
    const ok = createJournal(name);

    if (!ok) {
      Alert.alert(
        "Fonction Pro",
        "Les profils multiples (plusieurs journaux : Trading, Prop firm, Crypto, etc.) seront disponibles dans Trading Diary Pro (bientôt)."
      );
      return;
    }

    setNewJournalName("");
    setRenameValue(name);
  };

  const handleRenameActiveJournal = () => {
    if (activeJournal && renameValue.trim().length > 0) {
      renameJournal(activeJournal.id, renameValue.trim());
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
      ]}
    >
      {/* Titre + navigation mois */}
      <View style={styles.headerRow}>
        <Text
          style={[styles.arrow, { color: arrowColor }]}
          onPress={() => changeMonth("prev")}
        >
          {"<"}
        </Text>

        <Text
          style={[styles.headerTitle, { color: headerTitleColor }]}
        >
          {monthName}
        </Text>

        <Text
          style={[styles.arrow, { color: arrowColor }]}
          onPress={() => changeMonth("next")}
        >
          {">"}
        </Text>
      </View>

      {/* Sélecteur de profil / journal */}
      <View style={styles.journalRow}>
        <Text
          style={[styles.journalLabel, { color: journalLabelColor }]}
        >
          Profil
        </Text>
        <TouchableOpacity
          style={[
            styles.journalChip,
            {
              backgroundColor: journalChipBg,
              borderColor: journalChipBorder,
            },
          ]}
          onPress={openJournalModal}
        >
          <Text
            style={[
              styles.journalChipText,
              { color: journalChipTextColor },
            ]}
          >
            {activeJournal?.name ?? "Journal"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bloc animé (stat mois + calendrier) */}
      <Animated.View
        style={[styles.monthContentWrapper, animatedContentStyle]}
      >
        <View
          style={[
            styles.monthSummary,
            {
              backgroundColor: monthSummaryBg,
            },
          ]}
        >
          <View style={styles.summaryRowTop}>
            <View style={styles.summaryBlockLeft}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: summaryLabelColor },
                ]}
              >
                Résultat du mois (PnL)
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      monthStats.totalPnl > 0
                        ? "#22c55e"
                        : monthStats.totalPnl < 0
                        ? "#ef4444"
                        : isDark
                        ? "#e5e7eb"
                        : "#0f172a",
                  },
                ]}
              >
                {monthStats.totalPnl > 0 ? "+" : ""}
                {monthStats.totalPnl.toFixed(2)} {currency}
              </Text>
            </View>

            <View style={styles.summaryBlockMiddle}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: summaryLabelColor },
                ]}
              >
                Trades
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isDark ? "#e5e7eb" : "#0f172a" },
                ]}
              >
                {monthStats.tradeCount}
              </Text>
            </View>

            <View style={styles.summaryBlockRight}>
              {!isCurrentMonth && (
                <TouchableOpacity onPress={goToToday}>
                  <View style={styles.todayButton}>
                    <Text style={styles.todayButtonText}>
                      ↩ Retour{"\n"}Mois actuel
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.summaryRowBottom}>
            <View style={styles.summaryBottomLeft} />
            <View style={styles.summaryBlockMiddle}>
              <Text
                style={[
                  styles.summarySub,
                  { color: summarySubColor },
                ]}
              >
                Winrate {monthStats.winrate.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.summaryBottomRight} />
          </View>
        </View>

        <View className="weekdaysRow" style={styles.weekdaysRow}>
          {WEEKDAYS.map((d) => (
            <Text
              key={d}
              style={[styles.weekday, { color: weekdayColor }]}
            >
              {d}
            </Text>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.calendarContainer}>
          {daysMatrix.map((week, rowIndex) => (
            <View key={rowIndex} style={styles.weekRow}>
              {week.map((dayNumber, colIndex) => {
                const summary =
                  dayNumber !== null
                    ? getSummaryForDay(dayNumber)
                    : undefined;

                const isTodayCell =
                  isCurrentMonth && dayNumber === today.getDate();

                return (
                  <View
                    key={colIndex}
                    style={styles.dayWrapper}
                  >
                    {dayNumber === null ? (
                      <View style={[styles.cell, styles.emptyCell]} />
                    ) : (
                      <DayCell
                        dayNumber={dayNumber}
                        hasTrades={summary?.hasTrades ?? false}
                        pnl={
                          summary?.hasTrades
                            ? summary?.pnl
                            : undefined
                        }
                        rr={
                          summary?.hasTrades
                            ? summary?.rr
                            : undefined
                        }
                        onPress={() => handleDayPress(dayNumber)}
                        isToday={isTodayCell}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* MODAL JOURNAUX */}
      <Modal
        visible={journalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeJournalModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeJournalModal}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: modalCardBg,
                borderColor: modalCardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: modalTitleColor },
              ]}
            >
              Profils (journaux)
            </Text>

            {journals.map((j) => {
              const isActive =
                activeJournal && j.id === activeJournal.id;
              const baseItemStyle = {
                borderColor: journalItemBorder,
                backgroundColor: journalItemBg,
              };
              const activeItemStyle = isActive
                ? {
                    backgroundColor: journalItemBgActive,
                    borderColor: "#38bdf8",
                  }
                : {};
              return (
                <TouchableOpacity
                  key={j.id}
                  style={[
                    styles.journalItem,
                    baseItemStyle,
                    activeItemStyle,
                  ]}
                  onPress={() => {
                    setActiveJournal(j.id);
                    setRenameValue(j.name);
                  }}
                >
                  <Text
                    style={[
                      styles.journalItemText,
                      {
                        color: isActive
                          ? journalItemTextActiveColor
                          : journalItemTextColor,
                      },
                    ]}
                  >
                    {j.name}
                  </Text>
                  {isActive && (
                    <Text style={styles.journalItemBadge}>
                      Actif
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {activeJournal && (
              <>
                <Text
                  style={[
                    styles.modalLabel,
                    { marginTop: 12, color: modalLabelColor },
                  ]}
                >
                  Renommer le profil actif
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: modalInputBg,
                      borderColor: modalInputBorder,
                      color: modalInputTextColor,
                    },
                  ]}
                  placeholder={activeJournal.name}
                  placeholderTextColor="#6b7280"
                  value={renameValue}
                  onChangeText={setRenameValue}
                />
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonPrimary,
                  ]}
                  onPress={handleRenameActiveJournal}
                >
                  <Text style={styles.modalButtonText}>
                    Enregistrer le nom
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text
              style={[
                styles.modalLabel,
                { marginTop: 16, color: modalLabelColor },
              ]}
            >
              Nouveau profil
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: modalInputBg,
                  borderColor: modalInputBorder,
                  color: modalInputTextColor,
                },
              ]}
              placeholder="Ex : Prop firm, Crypto, Scalping..."
              placeholderTextColor="#6b7280"
              value={newJournalName}
              onChangeText={setNewJournalName}
            />
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonSecondary,
              ]}
              onPress={handleCreateJournal}
            >
              <Text style={styles.modalButtonText}>
                Créer et activer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonGhost,
              ]}
              onPress={closeJournalModal}
            >
              <Text style={styles.modalButtonGhostText}>
                Fermer
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  arrow: {
    color: "#e5e7eb",
    fontSize: 22,
  },
  journalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  journalLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginRight: 8,
  },
  journalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#020617",
  },
  journalChipText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  monthContentWrapper: {
    flex: 1,
  },
  monthSummary: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryRowTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  summaryBlockLeft: {
    flex: 1.2,
  },
  summaryBlockMiddle: {
    flex: 1,
    alignItems: "center",
  },
  summaryBlockRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  summaryBottomLeft: {
    flex: 1.2,
  },
  summaryBottomRight: {
    flex: 1,
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 11,
  },
  summaryValue: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
  summarySub: {
    color: "#9ca3af",
    fontSize: 11,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  todayButtonText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
  },
  calendarContainer: {
    paddingHorizontal: CELL_MARGIN,
    paddingBottom: 20,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: CELL_MARGIN + 2,
  },
  dayWrapper: {
    width: CELL_SIZE,
    height: CELL_HEIGHT,
    marginHorizontal: CELL_MARGIN / 2,
  },
  cell: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  emptyCell: {
    backgroundColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  modalTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: "#020617",
    color: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 4,
  },
  modalButton: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#22c55e",
  },
  modalButtonSecondary: {
    backgroundColor: "#1d4ed8",
  },
  modalButtonGhost: {
    backgroundColor: "transparent",
  },
  modalButtonText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 13,
  },
  modalButtonGhostText: {
    color: "#9ca3af",
    fontWeight: "500",
    fontSize: 13,
  },
  journalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f2933",
    marginTop: 4,
  },
  journalItemActive: {
    borderColor: "#38bdf8",
    backgroundColor: "#0b1120",
  },
  journalItemText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  journalItemBadge: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default AgendaScreen;
