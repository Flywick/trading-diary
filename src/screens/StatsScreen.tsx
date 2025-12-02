import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from "react-native-svg";
import { useJournal } from "../context/JournalContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Trade, useTrades } from "../context/TradesContext";

type MonthAgg = {
  key: string; // "2025-01"
  year: number;
  month: number; // 1-12
  pnl: number;
  count: number;
};

const StatsScreen: React.FC = () => {
  const { trades } = useTrades();
  const { currency, theme } = useSettings();
  const { language } = useLanguage();
  const { activeJournal } = useJournal();

  const isDark = theme === "dark";

  const t = (fr: string, en: string) => (language === "en" ? en : fr);

  const formatNumber = (n: number, decimals = 2) => {
    return n.toFixed(decimals).replace(".", ",");
  };

  const formatSigned = (n: number, decimals = 2) => {
    return (n >= 0 ? "+" : "") + formatNumber(n, decimals);
  };

  const monthsFr = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const monthsEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthsShortFr = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jui",
    "Juil",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const monthsShortEn = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatMonthLabel = (year: number, month: number) => {
    const arr = language === "en" ? monthsEn : monthsFr;
    const label = arr[month - 1] || `${month}`;
    return `${label} ${year}`;
  };

  // ✅ PnL cumulatif trade par trade (pour la courbe)
  const equityCurve = useMemo(() => {
    let total = 0;
    return trades.map((t) => {
      total += t.pnl;
      return total;
    });
  }, [trades]);

  // ✅ Stats globales + agrégations par mois + tri actifs
  const stats = useMemo(() => {
    if (trades.length === 0) {
      return {
        total: 0,
        wins: 0,
        losses: 0,
        breakeven: 0,
        winrate: 0,
        totalPnl: 0,
        avgPnl: 0,
        avgRr: 0,
        bestTrade: undefined as Trade | undefined,
        worstTrade: undefined as Trade | undefined,
        byInstrument: [] as {
          instrument: string;
          count: number;
          pnl: number;
        }[],
        months: [] as MonthAgg[],
        topMonths: [] as MonthAgg[],
      };
    }

    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const breakeven = trades.filter((t) => t.pnl === 0);

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgPnl = totalPnl / trades.length;

    const rrValues = trades
      .map((t) => t.rr)
      .filter((r): r is number => typeof r === "number");
    const avgRr =
      rrValues.length > 0
        ? rrValues.reduce((sum, r) => sum + r, 0) / rrValues.length
        : 0;

    const bestTrade = wins.length
      ? wins.reduce((best: Trade, t) => (t.pnl > best.pnl ? t : best), wins[0])
      : undefined;

    const worstTrade = losses.length
      ? losses.reduce(
          (worst: Trade, t) => (t.pnl < worst.pnl ? t : worst),
          losses[0]
        )
      : undefined;

    const byInstrumentMap = new Map<
      string,
      { instrument: string; count: number; pnl: number }
    >();

    const monthMap = new Map<string, MonthAgg>();

    for (const t of trades) {
      const keyInst = t.instrument || "Inconnu";
      const existingInst = byInstrumentMap.get(keyInst);
      if (!existingInst) {
        byInstrumentMap.set(keyInst, {
          instrument: keyInst,
          count: 1,
          pnl: t.pnl,
        });
      } else {
        existingInst.count += 1;
        existingInst.pnl += t.pnl;
      }

      if (t.date) {
        const parts = t.date.split("-").map((p) => parseInt(p, 10));
        if (parts.length === 3 && !parts.some((n) => isNaN(n))) {
          const [y, m] = parts;
          const monthKey = `${y}-${String(m).padStart(2, "0")}`;
          const existingMonth = monthMap.get(monthKey);
          if (!existingMonth) {
            monthMap.set(monthKey, {
              key: monthKey,
              year: y,
              month: m,
              pnl: t.pnl,
              count: 1,
            });
          } else {
            existingMonth.pnl += t.pnl;
            existingMonth.count += 1;
          }
        }
      }
    }

    const byInstrument = Array.from(byInstrumentMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.instrument.localeCompare(b.instrument);
    });

    const months = Array.from(monthMap.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    const topMonths = months
      .filter((m) => m.pnl > 0)
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 3);

    const denominator = wins.length + losses.length;
    const winrate = denominator > 0 ? (wins.length / denominator) * 100 : 0;

    return {
      total: trades.length,
      wins: wins.length,
      losses: losses.length,
      breakeven: breakeven.length,
      winrate,
      totalPnl,
      avgPnl,
      avgRr,
      bestTrade,
      worstTrade,
      byInstrument,
      months,
      topMonths,
    };
  }, [trades, language]);

  const chartData = equityCurve;
  const hasCurve = chartData.length > 0;

  let minVal = 0;
  let maxVal = 0;
  let zeroY = 50;
  let greenSegments: { points: string; key: string }[] = [];
  let redSegments: { points: string; key: string }[] = [];
  let pointCoords: {
    x: number;
    y: number;
    cumulative: number;
    tradePnl: number;
    key: string;
  }[] = [];

  const width = 100;
  const height = 100;
  const padding = 10;
  const drawableHeight = height - padding * 2;

  if (hasCurve) {
    minVal = Math.min(...chartData, 0);
    maxVal = Math.max(...chartData, 0);
    const range = maxVal - minVal || 1;
    const maxIndex = Math.max(chartData.length - 1, 1);

    pointCoords = chartData.map((v, index) => {
      const x = (index / maxIndex) * width;
      const y =
        padding + (1 - (v - minVal) / range) * drawableHeight;
      return {
        x,
        y,
        cumulative: v,
        tradePnl: trades[index]?.pnl ?? 0,
        key: `p-${index}`,
      };
    });

    zeroY =
      padding + (1 - (0 - minVal) / range) * drawableHeight;

    const segmentsGreen: { points: string; key: string }[] = [];
    const segmentsRed: { points: string; key: string }[] = [];

    for (let i = 0; i < pointCoords.length - 1; i++) {
      const p1 = pointCoords[i];
      const p2 = pointCoords[i + 1];

      const v1 = p1.cumulative;
      const v2 = p2.cumulative;

      if (v1 >= 0 && v2 >= 0) {
        segmentsGreen.push({
          points: `${p1.x},${p1.y} ${p2.x},${p2.y}`,
          key: `g-${i}`,
        });
        continue;
      }

      if (v1 < 0 && v2 < 0) {
        segmentsRed.push({
          points: `${p1.x},${p1.y} ${p2.x},${p2.y}`,
          key: `r-${i}`,
        });
        continue;
      }

      const tRatio = (0 - v1) / (v2 - v1 || 1);
      const xZero = p1.x + tRatio * (p2.x - p1.x);
      const yZero = p1.y + tRatio * (p2.y - p1.y);
      const pZero = { x: xZero, y: yZero };

      if (v1 >= 0 && v2 < 0) {
        segmentsGreen.push({
          points: `${p1.x},${p1.y} ${pZero.x},${pZero.y}`,
          key: `g-${i}-split`,
        });
        segmentsRed.push({
          points: `${pZero.x},${pZero.y} ${p2.x},${p2.y}`,
          key: `r-${i}-split`,
        });
      } else if (v1 < 0 && v2 >= 0) {
        segmentsRed.push({
          points: `${p1.x},${p1.y} ${pZero.x},${pZero.y}`,
          key: `r-${i}-split`,
        });
        segmentsGreen.push({
          points: `${pZero.x},${pZero.y} ${p2.x},${p2.y}`,
          key: `g-${i}-split`,
        });
      }
    }

    greenSegments = segmentsGreen;
    redSegments = segmentsRed;
  }

  const isPositive = stats.total > 0 && stats.totalPnl > 0;
  const isNegative = stats.total > 0 && stats.totalPnl < 0;

  const [chartWidthPx, setChartWidthPx] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    cumulative: number;
    tradePnl: number;
  } | null>(null);

  const handleChartPress = (event: any) => {
    if (!hasCurve || pointCoords.length === 0 || !chartWidthPx) return;

    const { locationX } = event.nativeEvent;
    const tapX = (locationX / chartWidthPx) * width;

    let closest = pointCoords[0];
    let minDx = Math.abs(closest.x - tapX);

    for (const p of pointCoords) {
      const dx = Math.abs(p.x - tapX);
      if (dx < minDx) {
        minDx = dx;
        closest = p;
      }
    }

    setSelectedPoint({
      x: closest.x,
      y: closest.y,
      cumulative: closest.cumulative,
      tradePnl: closest.tradePnl,
    });
  };

  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const minYear = 2000;

  useEffect(() => {
    if (stats.months.length > 0 && !selectedMonthKey) {
      const last = stats.months[stats.months.length - 1];
      setSelectedMonthKey(last.key);
      setPickerYear(last.year);
    }
  }, [stats.months, selectedMonthKey]);

  useEffect(() => {
    if (!pickerYear && selectedMonthKey) {
      const found = stats.months.find((m) => m.key === selectedMonthKey);
      if (found) {
        setPickerYear(found.year);
      }
    }
  }, [pickerYear, selectedMonthKey, stats.months]);

  const selectedMonth: MonthAgg | null =
    stats.months.find((m) => m.key === selectedMonthKey) || null;

  const changeYear = (delta: number) => {
    setPickerYear((prev) => {
      const base = prev ?? currentYear;
      let next = base + delta;
      if (next < minYear) next = minYear;
      if (next > currentYear) next = currentYear;
      return next;
    });
  };

  const handleSelectMonth = (monthIndex: number) => {
    if (!pickerYear) return;
    const monthNumber = monthIndex + 1;
    const key = `${pickerYear}-${String(monthNumber).padStart(2, "0")}`;
    setSelectedMonthKey(key);
    setShowMonthPicker(false);
  };

  const [showAllInstruments, setShowAllInstruments] = useState(false);
  const instrumentsToShow = showAllInstruments
    ? stats.byInstrument
    : stats.byInstrument.slice(0, 3);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#020617" : "#f1f5f9" },
      ]}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      {/* Titre + profil actif */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t("Statistiques", "Statistics")}</Text>
        {activeJournal && (
          <Text style={styles.titleProfile}>
            {activeJournal.name}
          </Text>
        )}
      </View>

      {stats.total === 0 ? (
        <View style={styles.card}>
          <Text style={styles.value}>
            {t(
              "Pas encore de trades. Ajoute quelques trades pour voir tes stats.",
              "No trades yet. Add some trades to see your stats."
            )}
          </Text>
        </View>
      ) : (
        <>
          {/* Courbe equity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t("Évolution des trades", "Trades performance")} ({currency})
            </Text>

            {hasCurve ? (
              <>
                <View
                  style={{ height: 200, marginTop: 8 }}
                  onLayout={(e) =>
                    setChartWidthPx(e.nativeEvent.layout.width)
                  }
                >
                  <View style={{ flex: 1, position: "relative" }}>
                    <Svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 100 100"
                    >
                      <Line
                        x1={0}
                        y1={zeroY}
                        x2={100}
                        y2={zeroY}
                        stroke="#4b5563"
                        strokeWidth={0.6}
                      />

                      {greenSegments.map((seg) => (
                        <Polyline
                          key={seg.key}
                          points={seg.points}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth={1.6}
                        />
                      ))}

                      {redSegments.map((seg) => (
                        <Polyline
                          key={seg.key}
                          points={seg.points}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth={1.6}
                        />
                      ))}

                      {pointCoords.map((p) => (
                        <Circle
                          key={p.key}
                          cx={p.x}
                          cy={p.y}
                          r={1.6}
                          fill={
                            p.cumulative > 0
                              ? "#22c55e"
                              : p.cumulative < 0
                              ? "#ef4444"
                              : "#9ca3af"
                          }
                        />
                      ))}

                      {selectedPoint && (
                        <>
                          <Circle
                            cx={selectedPoint.x}
                            cy={selectedPoint.y}
                            r={2.4}
                            fill="#facc15"
                          />
                          <SvgText
                            x={selectedPoint.x}
                            y={Math.max(selectedPoint.y - 6, 8)}
                            fontSize={4}
                            fill="#e5e7eb"
                            textAnchor="middle"
                          >
                            {`${formatSigned(
                              selectedPoint.tradePnl,
                              2
                            )} (${formatSigned(
                              selectedPoint.cumulative,
                              2
                            )})`}
                          </SvgText>
                        </>
                      )}
                    </Svg>

                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={handleChartPress}
                    />
                  </View>
                </View>

                <View style={styles.rowBetween}>
                  <Text style={styles.label}>
                    {t("Min", "Min")}: {formatNumber(minVal, 2)}
                  </Text>
                  <Text style={styles.label}>
                    {t("Max", "Max")}: {formatNumber(maxVal, 2)}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.value}>
                {t(
                  "Pas assez de données pour afficher la courbe.",
                  "Not enough data to display the curve."
                )}
              </Text>
            )}
          </View>

          {/* Vue d’ensemble */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t("Vue d'ensemble", "Overview")}
            </Text>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{t("Total trades", "Total trades")}</Text>
              <Text style={styles.value}>{stats.total}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{t("Gagnants", "Winners")}</Text>
              <Text style={[styles.value, { color: "#22c55e" }]}>
                {stats.wins}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{t("Perdants", "Losers")}</Text>
              <Text style={[styles.value, { color: "#ef4444" }]}>
                {stats.losses}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{t("Neutres", "Breakeven")}</Text>
              <Text style={styles.value}>{stats.breakeven}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{t("Winrate", "Winrate")}</Text>
              <Text style={styles.value}>
                {formatNumber(stats.winrate, 1)} %
              </Text>
            </View>
          </View>

          {/* PnL global */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Résultat (PnL)</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {t("PnL total", "Total PnL")} ({currency})
              </Text>
              <Text
                style={[
                  styles.value,
                  isPositive && { color: "#22c55e" },
                  isNegative && { color: "#ef4444" },
                ]}
              >
                {formatNumber(stats.totalPnl, 2)}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {t("PnL moyen / trade", "Avg PnL / trade")} ({currency})
              </Text>
              <Text style={styles.value}>
                {formatNumber(stats.avgPnl, 2)}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {t("RR moyen (si renseigné)", "Avg RR (if filled)")}
              </Text>
              <Text style={styles.value}>
                {formatNumber(stats.avgRr, 2)}
              </Text>
            </View>
          </View>

          {/* Meilleur / pire trade */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t("Meilleur / pire trade", "Best / worst trade")}
            </Text>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {t("Meilleur trade", "Best trade")}
              </Text>
              <Text style={[styles.value, { color: "#22c55e" }]}>
                {stats.bestTrade
                  ? formatSigned(stats.bestTrade.pnl, 2)
                  : "-"}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {t("Pire trade", "Worst trade")}
              </Text>
              <Text style={[styles.value, { color: "#ef4444" }]}>
                {stats.worstTrade
                  ? formatSigned(stats.worstTrade.pnl, 2)
                  : "-"}
              </Text>
            </View>
          </View>

          {/* Par actif / paire */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>
                {t("Par actif / paire", "By asset / pair")}
              </Text>
              {stats.byInstrument.length > 3 && (
                <Pressable
                  onPress={() => setShowAllInstruments((prev) => !prev)}
                >
                  <Text
                    style={{
                      color: "#60a5fa",
                      fontSize: 12,
                    }}
                  >
                    {showAllInstruments
                      ? t("Voir moins", "Show less")
                      : t("Voir tout", "Show all")}
                  </Text>
                </Pressable>
              )}
            </View>

            {stats.byInstrument.length === 0 ? (
              <Text style={styles.value}>
                {t("Aucun actif / paire.", "No asset / pair.")}
              </Text>
            ) : (
              instrumentsToShow.map((item) => {
                const positive = item.pnl > 0;
                const negative = item.pnl < 0;
                return (
                  <View key={item.instrument} style={styles.rowBetween}>
                    <View>
                      <Text style={styles.value}>{item.instrument}</Text>
                      <Text style={styles.label}>
                        {item.count} {t("trades", "trades")}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.value,
                        positive && { color: "#22c55e" },
                        negative && { color: "#ef4444" },
                      ]}
                    >
                      {formatSigned(item.pnl, 2)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Performance par mois */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t("Performance par mois", "Monthly performance")}
            </Text>

            {stats.months.length === 0 ? (
              <Text style={styles.value}>
                {t("Aucune donnée mensuelle.", "No monthly data.")}
              </Text>
            ) : (
              <>
                <Pressable
                  onPress={() => {
                    if (selectedMonth) {
                      setPickerYear(selectedMonth.year);
                    }
                    setShowMonthPicker((prev) => !prev);
                  }}
                  style={[
                    styles.monthSelector,
                    { borderColor: "#1f2933", backgroundColor: "#020617" },
                  ]}
                >
                  <View>
                    <Text style={[styles.value, { fontWeight: "600" }]}>
                      {selectedMonth
                        ? formatMonthLabel(
                            selectedMonth.year,
                            selectedMonth.month
                          )
                        : "-"}
                    </Text>
                    <Text style={styles.label}>
                      {selectedMonth
                        ? `${selectedMonth.count} ${t("trades", "trades")}`
                        : ""}
                    </Text>
                  </View>
                  <Text style={{ color: "#9ca3af", fontSize: 18 }}>⌵</Text>
                </Pressable>

                {showMonthPicker && (
                  <View style={styles.monthPicker}>
                    <View style={[styles.rowBetween, { marginBottom: 8 }]}>
                      <Pressable
                        style={styles.yearButton}
                        onPress={() => changeYear(-1)}
                      >
                        <Text style={{ color: "#9ca3af", fontSize: 18 }}>
                          ‹
                        </Text>
                      </Pressable>

                      <Text
                        style={{
                          color: "#e5e7eb",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {pickerYear ?? currentYear}
                      </Text>

                      <Pressable
                        style={styles.yearButton}
                        onPress={() => changeYear(1)}
                      >
                        <Text style={{ color: "#9ca3af", fontSize: 18 }}>
                          ›
                        </Text>
                      </Pressable>
                    </View>

                    <View className="month-grid" style={styles.monthGrid}>
                      {(language === "en"
                        ? monthsShortEn
                        : monthsShortFr
                      ).map((label, index) => (
                        <Pressable
                          key={label}
                          style={styles.monthItem}
                          onPress={() => handleSelectMonth(index)}
                        >
                          <Text style={styles.monthItemText}>{label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {selectedMonth && (
                  <View style={[styles.rowBetween, { marginTop: 8 }]}>
                    <Text style={styles.label}>
                      {t("PnL du mois", "PnL this month")}
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        selectedMonth.pnl > 0 && { color: "#22c55e" },
                        selectedMonth.pnl < 0 && { color: "#ef4444" },
                      ]}
                    >
                      {formatSigned(selectedMonth.pnl, 2)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Top 3 mois */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t("Top 3 mois", "Top 3 months")}
            </Text>
            {stats.topMonths.length === 0 ? (
              <Text style={styles.value}>
                {t(
                  "Aucun mois positif pour le moment.",
                  "No positive month yet."
                )}
              </Text>
            ) : (
              stats.topMonths.map((m, index) => (
                <View key={m.key} style={styles.rowBetween}>
                  <View>
                    <Text style={styles.value}>
                      #{index + 1} {formatMonthLabel(m.year, m.month)}
                    </Text>
                    <Text style={styles.label}>
                      {m.count} {t("trades", "trades")}
                    </Text>
                  </View>
                  <Text style={[styles.value, { color: "#22c55e" }]}>
                    {formatSigned(m.pnl, 2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
  },
  titleProfile: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#111827",
  },
  cardTitle: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
  },
  value: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  monthPicker: {
    marginTop: 6,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#020617",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  monthItem: {
    width: "30%",
    paddingVertical: 6,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
  },
  monthItemText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StatsScreen;