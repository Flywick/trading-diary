// src/screens/SettingsScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FEATURES } from "../config/features";
import { useAccount } from "../context/AccountContext";
import { useJournal } from "../context/JournalContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useTrades } from "../context/TradesContext";
import { useI18n } from "../i18n/useI18n";

const formatBirthdate = (text: string) => {
  const cleaned = text.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
};

const getAgeFromBirthdate = (birthdate: string): number | null => {
  if (!birthdate) return null;
  const parts = birthdate.split("-");
  if (parts.length !== 3) return null;

  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const today = new Date();
  const birth = new Date(year, month - 1, day);

  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const hasNotBirthdayThisYear =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate());

  if (hasNotBirthdayThisYear) {
    age -= 1;
  }

  if (age < 0 || age > 120) return null;

  return age;
};

const SUPPORT_EMAIL = "tradingdiary.app@gmail.com";

const SettingsScreen: React.FC = () => {
  const router = useRouter();

  const {
    currency,
    theme,
    timeFormat24h,
    setCurrency,
    setTheme,
    setTimeFormat24h,
  } = useSettings();
  const { trades, resetTrades } = useTrades();
  const { journals, activeJournal } = useJournal();
  const {
    activeAccount,
    updateActiveAccount,
    deleteActiveAccount,
    logout,
  } = useAccount();
  const { setLanguage } = useLanguage();
  const { t, language } = useI18n();

  const [usernameInput, setUsernameInput] = useState(
    activeAccount?.username ?? ""
  );
  const [birthdateInput, setBirthdateInput] = useState(
    activeAccount?.birthdate ?? ""
  );
  const [emailInput, setEmailInput] = useState(activeAccount?.email ?? "");
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  // 🔐 Modal de confirmation par mot de passe pour la suppression de compte
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setUsernameInput(activeAccount?.username ?? "");
    setBirthdateInput(activeAccount?.birthdate ?? "");
    setEmailInput(activeAccount?.email ?? "");
    setIsEditingAccount(false);
    setIsEditingPassword(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");

    setShowDeleteConfirmModal(false);
    setDeletePasswordInput("");
    setDeleteError("");
  }, [activeAccount]);

  const liveAge = getAgeFromBirthdate(birthdateInput);
  const accountAge = activeAccount
    ? getAgeFromBirthdate(activeAccount.birthdate)
    : null;

  const isDark = theme === "dark";
  const screenBg = isDark ? "#020617" : "#e5e7eb";
  const cardBg = isDark ? "#020617" : "#ffffff";
  const cardBorder = isDark ? "#111827" : "#d1d5db";
  const mainText = isDark ? "#e5e7eb" : "#0f172a";
  const subText = isDark ? "#9ca3af" : "#6b7280";

  const chipBorder = isDark ? "#4b5563" : "#cbd5e1";
  const chipBg = isDark ? "#020617" : "#f9fafb";
  const chipActiveBg = "rgba(52,211,153,0.18)";
  const chipActiveBorder = "#34d399";
  const chipActiveText = isDark ? "#ffffff" : "#064e3b";

  const inputBg = isDark ? "#020617" : "#f9fafb";
  const inputBorder = isDark ? "#111827" : "#d1d5db";
  const inputText = mainText;

  const handleSaveAccount = () => {
    if (!activeAccount) {
      Alert.alert(t("settings.deleteAccountNoAccount"), t("errors.noAccount"));
      return;
    }

    const username = usernameInput.trim();
    const birthdate = birthdateInput.trim();
    const email = emailInput.trim();

    if (!username || !birthdate || !email) {
      Alert.alert(
        t("settings.accountInfosMissingTitle"),
        t("settings.accountInfosMissingMessage")
      );
      return;
    }

    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(birthdate)) {
      Alert.alert(
        t("settings.accountInvalidBirthdateTitle"),
        t("settings.accountInvalidBirthdateMessage")
      );
      return;
    }

    const age = getAgeFromBirthdate(birthdate);
    if (age === null) {
      Alert.alert(t("errors.invalidBirthdate"), t("errors.invalidBirthdate"));
      return;
    }
    if (age < 18) {
      Alert.alert(t("errors.ageTooLow"), t("errors.ageTooLow"));
      return;
    }

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      Alert.alert(t("errors.invalidEmail"), t("errors.invalidEmail"));
      return;
    }

    updateActiveAccount({
      username,
      birthdate,
      email,
    });

    setIsEditingAccount(false);

    Alert.alert(
      t("settings.accountUpdatedTitle"),
      t("settings.accountUpdatedMessage")
    );
  };

  const handleChangePassword = () => {
    if (!activeAccount) {
      Alert.alert(t("settings.deleteAccountNoAccount"), t("errors.noAccount"));
      return;
    }

    if (!activeAccount.password) {
      Alert.alert(
        t("settings.passwordNotDefinedTitle"),
        t("settings.passwordNotDefinedMessage")
      );
      return;
    }

    const currentPassword = currentPasswordInput.trim();
    const newPassword = newPasswordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        t("errors.missingLoginFields"),
        t("errors.missingLoginFields")
      );
      return;
    }

    if (currentPassword !== activeAccount.password) {
      Alert.alert(
        t("settings.passwordIncorrect"),
        t("settings.passwordIncorrect")
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("errors.passwordTooShort"), t("errors.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("errors.passwordConfirmMismatch"),
        t("errors.passwordConfirmMismatch")
      );
      return;
    }

    updateActiveAccount({ password: newPassword } as any);

    setIsEditingPassword(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");

    Alert.alert(
      t("settings.passwordUpdatedTitle"),
      t("settings.passwordUpdatedMessage")
    );
  };

  const handleExportCsv = async () => {
    if (!activeAccount) {
      Alert.alert(t("settings.deleteAccountNoAccount"), t("errors.noAccount"));
      return;
    }

    if (!trades || trades.length === 0) {
      Alert.alert(t("stats.noTrades"), t("stats.noTrades"));
      return;
    }

    try {
      const escapeCsv = (value: any) => {
        if (value === null || value === undefined) return "";
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };

      const header = [
        "id",
        "date",
        "time",
        "instrument",
        "direction",
        "pnl",
        "rr",
        "lotSize",
        "entryPrice",
        "tpPrice",
        "slPrice",
        "emotion",
        "quality",
        "respectPlan",
        "comment",
      ];

      const lines: string[] = [];
      lines.push(header.join(";"));

      for (const tTrade of trades) {
        const row = [
          escapeCsv(tTrade.id),
          escapeCsv(tTrade.date),
          escapeCsv(tTrade.time),
          escapeCsv(tTrade.instrument),
          escapeCsv(tTrade.direction),
          escapeCsv(
            typeof tTrade.pnl === "number"
              ? tTrade.pnl.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof tTrade.rr === "number"
              ? tTrade.rr.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof tTrade.lotSize === "number"
              ? tTrade.lotSize.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof tTrade.entryPrice === "number"
              ? tTrade.entryPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof tTrade.tpPrice === "number"
              ? tTrade.tpPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof tTrade.slPrice === "number"
              ? tTrade.slPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(tTrade.emotion ?? ""),
          escapeCsv(tTrade.quality ?? ""),
          escapeCsv(
            typeof tTrade.respectPlan === "boolean"
              ? tTrade.respectPlan
                ? "oui"
                : "non"
              : ""
          ),
          escapeCsv(tTrade.comment ?? ""),
        ];
        lines.push(row.join(";"));
      }

      const csvContent = lines.join("\n");

      const safeUsername = (activeAccount.username || "compte")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 20);

      const dateTag = new Date().toISOString().slice(0, 10);
      const fileName = `trades_${safeUsername}_${dateTag}.csv`;

      const baseDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
      const fileUri = baseDir + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: t("settings.exportCsvButton"),
        });
      } else {
        Alert.alert(
          t("settings.exportCsvDoneTitle"),
          t("settings.exportCsvDoneMessage")
        );
      }
    } catch (error) {
      console.error("Erreur export CSV", error);
      Alert.alert(
        t("settings.exportCsvErrorTitle"),
        t("settings.exportCsvErrorMessage")
      );
    }
  };

  const handleExportJson = async () => {
    if (!activeAccount) {
      Alert.alert(t("settings.deleteAccountNoAccount"), t("errors.noAccount"));
      return;
    }

    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        account: {
          id: activeAccount.id,
          username: activeAccount.username,
          birthdate: activeAccount.birthdate,
          email: activeAccount.email,
          createdAt: activeAccount.createdAt,
        },
        settings: {
          theme,
          currency,
          timeFormat24h,
          language,
        },
        journals: {
          journals,
          activeJournalId: activeJournal ? activeJournal.id : undefined,
        },
        trades,
      };

      const jsonContent = JSON.stringify(payload, null, 2);

      const safeUsername = (activeAccount.username || "compte")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 20);
      const dateTag = new Date().toISOString().slice(0, 10);
      const fileName = `backup_${safeUsername}_${dateTag}.json`;

      const baseDir =
        FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
      const fileUri = baseDir + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: t("settings.exportJsonButton"),
        });
      } else {
        Alert.alert(
          t("settings.importJsonDoneTitle"),
          t("settings.importJsonDoneMessage")
        );
      }
    } catch (error) {
      console.error("Erreur export JSON", error);
      Alert.alert(
        t("settings.importJsonErrorTitle"),
        t("settings.importJsonErrorMessage")
      );
    }
  };

  const handleImportJson = async () => {
    if (!activeAccount) {
      Alert.alert(t("settings.deleteAccountNoAccount"), t("errors.noAccount"));
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      // @ts-ignore
      if (result.canceled) {
        return;
      }

      // @ts-ignore
      const asset = result.assets && result.assets[0];
      if (!asset || !asset.uri) {
        Alert.alert(
          t("settings.exportJsonErrorTitle"),
          t("settings.exportJsonErrorMessage")
        );
        return;
      }

      const content = await FileSystem.readAsStringAsync(asset.uri);
      let data: any;
      try {
        data = JSON.parse(content);
      } catch (e) {
        Alert.alert(
          t("settings.importJsonInvalidFileTitle"),
          t("settings.importJsonInvalidFileMessage")
        );
        return;
      }

      if (!data || typeof data !== "object") {
        Alert.alert(
          t("settings.importJsonInvalidFileTitle"),
          t("settings.importJsonInvalidContentMessage")
        );
        return;
      }

      if (data.account) {
        const patch: any = {};
        if (typeof data.account.username === "string") {
          patch.username = data.account.username;
        }
        if (typeof data.account.birthdate === "string") {
          patch.birthdate = data.account.birthdate;
        }
        if (typeof data.account.email === "string") {
          patch.email = data.account.email;
        }
        if (typeof data.account.password === "string") {
          patch.password = data.account.password;
        }

        if (Object.keys(patch).length > 0) {
          updateActiveAccount(patch);
        }
      }

      if (data.settings) {
        if (data.settings.theme === "dark" || data.settings.theme === "light") {
          setTheme(data.settings.theme);
        }
        if (data.settings.currency) {
          setCurrency(data.settings.currency);
        }
        if (typeof data.settings.timeFormat24h === "boolean") {
          setTimeFormat24h(data.settings.timeFormat24h);
        }
        if (data.settings.language === "fr" || data.settings.language === "en") {
          setLanguage(data.settings.language);
        }
      }

      const accountId = activeAccount.id;

      if (data.journals && data.journals.journals) {
        const journalsKey = "@trading-diary-journals-v1-" + accountId;
        const stateToStore = {
          journals: Array.isArray(data.journals.journals)
            ? data.journals.journals
            : [],
          activeJournalId:
            typeof data.journals.activeJournalId === "string"
              ? data.journals.activeJournalId
              : undefined,
        };
        await AsyncStorage.setItem(journalsKey, JSON.stringify(stateToStore));
      }

      if (Array.isArray(data.trades)) {
        const tradesKey = "@trading-diary-trades-v1-" + accountId;
        await AsyncStorage.setItem(tradesKey, JSON.stringify(data.trades));
      }

      Alert.alert(
        t("settings.importJsonDoneTitle"),
        t("settings.importJsonDoneMessage")
      );
    } catch (error) {
      console.error("Erreur import JSON", error);
      Alert.alert(
        t("settings.importJsonErrorTitle"),
        t("settings.importJsonErrorMessage")
      );
    }
  };

  const handleResetApp = () => {
    Alert.alert(t("settings.resetAppTitle"), t("settings.resetAppMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.resetAppConfirm"),
        style: "destructive",
        onPress: () => {
          resetTrades();
          Alert.alert(
            t("settings.resetAppDoneTitle"),
            t("settings.resetAppDoneMessage")
          );
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    if (!activeAccount) {
      Alert.alert(
        t("settings.deleteAccountNoAccount"),
        t("settings.deleteAccountNoAccount")
      );
      return;
    }

    Alert.alert(
      t("settings.deleteAccountTitle"),
      t("settings.deleteAccountMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.deleteAccountConfirm"),
          style: "destructive",
          onPress: () => {
            setDeletePasswordInput("");
            setDeleteError("");
            setShowDeleteConfirmModal(true);
          },
        },
      ]
    );
  };

  const confirmDeleteWithPassword = () => {
    if (!activeAccount) {
      setShowDeleteConfirmModal(false);
      return;
    }

    const entered = deletePasswordInput.trim();

    if (!entered) {
      setDeleteError(t("settings.deleteAccountPasswordErrorEmpty"));
      return;
    }

    if (entered !== activeAccount.password) {
      setDeleteError(t("settings.deleteAccountPasswordErrorWrong"));
      return;
    }

    Alert.alert(
      t("settings.deleteAccountFinalTitle"),
      t("settings.deleteAccountFinalMessage"),
      [
        {
          text: t("common.ok"),
          onPress: () => {
            setShowDeleteConfirmModal(false);
            setDeletePasswordInput("");
            setDeleteError("");
            deleteActiveAccount();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    if (!activeAccount) {
      Alert.alert(
        t("settings.deleteAccountNoAccount"),
        t("settings.deleteAccountNoAccount")
      );
      return;
    }

    Alert.alert(t("settings.logoutTitle"), t("settings.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logoutButton"),
        style: "destructive",
        onPress: () => {
          Alert.alert(
            t("settings.logoutDoneTitle"),
            t("settings.logoutDoneMessage"),
            [
              {
                text: t("common.ok"),
                onPress: () => {
                  logout();
                },
              },
            ]
          );
        },
      },
    ]);
  };

  const getInitial = (name: string | undefined) => {
    if (!name || name.length === 0) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const openSupportEmail = async () => {
    const subject =
      language === "en"
        ? "Support - Trading Diary"
        : "Support - Trading Diary";
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert(
        t("settings.supportErrorTitle"),
        t("settings.supportErrorMessage")
      );
      return;
    }
    await Linking.openURL(url);
  };

  const openSuggestionsEmail = async () => {
    const subject =
      language === "en"
        ? "Suggestion - Trading Diary"
        : "Suggestion - Trading Diary";
    const body =
      language === "en"
        ? "Hi,\n\nI have a suggestion:\n\n"
        : "Bonjour,\n\nJ’ai une suggestion :\n\n";
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert(
        t("settings.supportErrorTitle"),
        t("settings.supportErrorMessage")
      );
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: screenBg }]}
      edges={["top"]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: screenBg }]}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 32 }}
      >
        {/* SECTION COMPTE */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.accountSectionTitle")}
        </Text>

        {isEditingAccount ? (
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.subTitle, { color: mainText }]}>
              {t("settings.editAccountButton")}
            </Text>

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.usernameLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.usernamePlaceholder")}
              placeholderTextColor="#6b7280"
              value={usernameInput}
              onChangeText={setUsernameInput}
            />

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.birthdateLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.birthdatePlaceholder")}
              placeholderTextColor="#6b7280"
              value={birthdateInput}
              onChangeText={(text) => setBirthdateInput(formatBirthdate(text))}
              keyboardType="numeric"
            />
            {liveAge !== null && (
              <Text style={[styles.helperText, { color: subText }]}>
                {language === "en"
                  ? `Calculated age: ${liveAge} years`
                  : `Âge calculé : ${liveAge} ans`}
              </Text>
            )}

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.emailLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.emailPlaceholder")}
              placeholderTextColor="#6b7280"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSaveAccount}
            >
              <Text style={styles.buttonText}>
                {t("settings.saveAccountButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={() => setIsEditingAccount(false)}
            >
              <Text style={styles.buttonGhostText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        ) : isEditingPassword ? (
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.subTitle, { color: mainText }]}>
              {t("settings.editPasswordButton")}
            </Text>

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.currentPasswordLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.currentPasswordPlaceholder")}
              placeholderTextColor="#6b7280"
              value={currentPasswordInput}
              onChangeText={setCurrentPasswordInput}
              secureTextEntry
            />

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.newPasswordLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.newPasswordPlaceholder")}
              placeholderTextColor="#6b7280"
              value={newPasswordInput}
              onChangeText={setNewPasswordInput}
              secureTextEntry
            />

            <Text style={[styles.label, { color: subText }]}>
              {t("settings.confirmNewPasswordLabel")} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.confirmPasswordPlaceholder")}
              placeholderTextColor="#6b7280"
              value={confirmPasswordInput}
              onChangeText={setConfirmPasswordInput}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>
                {t("settings.editPasswordButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={() => setIsEditingPassword(false)}
            >
              <Text style={styles.buttonGhostText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.accountHeaderRow}>
              <View className="avatar" style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitial(activeAccount?.username)}
                </Text>
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={[styles.accountUsername, { color: mainText }]}>
                  {activeAccount?.username ?? t("settings.accountLocalInfo")}
                </Text>
                <Text style={[styles.accountEmail, { color: subText }]}>
                  {activeAccount?.email ?? t("settings.noEmailFallback")}
                </Text>

                {accountAge !== null && (
                  <Text style={[styles.helperText, { color: subText }]}>
                    {accountAge} ans – {activeAccount?.birthdate}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.accountInfoRow}>
              <Text style={[styles.label, { color: subText }]}>
                {t("settings.accountLocalInfo")}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondaryLight]}
              onPress={() => setIsEditingAccount(true)}
            >
              <Text style={styles.buttonText}>
                {t("settings.editAccountButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondaryLight]}
              onPress={() => setIsEditingPassword(true)}
            >
              <Text style={styles.buttonText}>
                {t("settings.editPasswordButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonGhostText}>
                {t("settings.logoutButton")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION PRÉFÉRENCES */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.preferencesSectionTitle") ?? "Préférences"}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.subTitle, { color: mainText }]}>
            {t("settings.languageSectionTitle")}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                language === "fr" && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setLanguage("fr")}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: language === "fr" ? chipActiveText : mainText,
                  },
                ]}
              >
                Français
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                language === "en" && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: language === "en" ? chipActiveText : mainText,
                  },
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subTitle, { color: mainText }]}>
            {t("settings.currencySectionTitle")}
          </Text>
          <View style={styles.row}>
            {["EUR", "USD", "GBP", "JPY"].map((c) => {
              const active = currency === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    {
                      borderColor: chipBorder,
                      backgroundColor: chipBg,
                    },
                    active && {
                      backgroundColor: chipActiveBg,
                      borderColor: chipActiveBorder,
                    },
                  ]}
                  onPress={() => setCurrency(c as any)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? chipActiveText : mainText },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subTitle, { color: mainText }]}>
            {t("settings.themeSectionTitle")}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                theme === "dark" && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setTheme("dark")}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme === "dark" ? chipActiveText : mainText },
                ]}
              >
                {t("settings.themeDark")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                theme === "light" && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setTheme("light")}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme === "light" ? chipActiveText : mainText },
                ]}
              >
                {t("settings.themeLight")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subTitle, { color: mainText }]}>
            {t("settings.timeFormatSectionTitle")}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                timeFormat24h && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setTimeFormat24h(true)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: timeFormat24h ? chipActiveText : mainText },
                ]}
              >
                {t("settings.format24h")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor: chipBorder,
                  backgroundColor: chipBg,
                },
                !timeFormat24h && {
                  backgroundColor: chipActiveBg,
                  borderColor: chipActiveBorder,
                },
              ]}
              onPress={() => setTimeFormat24h(false)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !timeFormat24h ? chipActiveText : mainText },
                ]}
              >
                {t("settings.format12h")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION VERSION */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.versionSectionTitle")}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text
            style={[
              styles.value,
              { fontWeight: "600", marginBottom: 4, color: mainText },
            ]}
          >
            {t("settings.versionName")}
          </Text>
          <Text style={[styles.label, { color: subText }]}>
            {t("settings.versionDescription")}
          </Text>
          <Text style={[styles.label, { marginTop: 6, color: subText }]}>
            {t("settings.versionProNote")}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondaryLight,
              { marginTop: 12 },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                t("settings.versionProAlertTitle"),
                t("settings.versionProAlertMessage")
              );
            }}
          >
            <Text style={styles.buttonText}>
              {t("settings.versionProButton")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION EXPORT CSV (V1: masquée, V2: réactivable) */}
        {FEATURES.EXPORT_CSV && (
          <>
            <Text style={[styles.sectionTitle, { color: mainText }]}>
              {t("settings.exportCsvSectionTitle")}
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <Text style={[styles.label, { color: subText }]}>
                {t("settings.exportCsvDescription")}
              </Text>
              <Text
                style={[
                  styles.helperText,
                  { marginBottom: 0, color: subText },
                ]}
              >
                {t("settings.exportCsvHelper")}
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonSecondaryLight,
                  { marginTop: 12 },
                ]}
                activeOpacity={0.7}
                onPress={handleExportCsv}
              >
                <Text style={styles.buttonText}>
                  {t("settings.exportCsvButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* SECTION EXPORT / IMPORT JSON */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.exportJsonSectionTitle")}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.label, { color: subText }]}>
            {t("settings.exportJsonDescription")}
          </Text>
          <Text
            style={[styles.helperText, { marginBottom: 0, color: subText }]}
          >
            {t("settings.exportJsonHelper")}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondaryLight,
              { marginTop: 12 },
            ]}
            activeOpacity={0.7}
            onPress={handleExportJson}
          >
            <Text style={styles.buttonText}>
              {t("settings.exportJsonButton")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondaryLight,
              { marginTop: 8 },
            ]}
            activeOpacity={0.7}
            onPress={handleImportJson}
          >
            <Text style={styles.buttonText}>
              {t("settings.importJsonButton")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ NOUVELLE SECTION : CGU/PRIVACY + SUPPORT + SUGGESTIONS (en bas) */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.helpSectionTitle")}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondaryLight, { marginTop: 0 }]}
            activeOpacity={0.7}
            onPress={() => router.push("/legal")}
          >
            <Text style={styles.buttonText}>
              {t("settings.legalPrivacyButton")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondaryLight, { marginTop: 10 }]}
            activeOpacity={0.7}
            onPress={openSupportEmail}
          >
            <Text style={styles.buttonText}>{t("settings.supportButton")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondaryLight, { marginTop: 10 }]}
            activeOpacity={0.7}
            onPress={openSuggestionsEmail}
          >
            <Text style={styles.buttonText}>
              {t("settings.suggestionsButton")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.helperText, { color: subText }]}>
            {t("settings.helpEmailNote", { email: SUPPORT_EMAIL } as any)}
          </Text>
        </View>

        {/* SECTION RÉINITIALISATION */}
        <Text style={[styles.sectionTitle, { color: mainText }]}>
          {t("settings.resetSectionTitle")}
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonWarning]}
          onPress={handleResetApp}
        >
          <Text style={styles.buttonText}>{t("settings.resetTradesButton")}</Text>
        </TouchableOpacity>
        <Text style={[styles.helperText, { color: subText }]}>
          {t("settings.resetTradesHelper")}
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>
            {t("settings.deleteAccountButton")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperTextDanger}>
          {t("settings.deleteAccountWarning")}
        </Text>
      </ScrollView>

      {/* 🔐 MODAL CONFIRMATION MOT DE PASSE SUPPRESSION COMPTE */}
      {showDeleteConfirmModal && (
        <View style={styles.deleteModalOverlay}>
          <View
            style={[
              styles.deleteModalCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.deleteModalTitle, { color: mainText }]}>
              {t("settings.deleteAccountModalTitle")}
            </Text>
            <Text style={[styles.deleteModalMessage, { color: subText }]}>
              {t("settings.deleteAccountModalMessage") ??
                "Pour confirmer la suppression définitive de ce compte, entre ton mot de passe."}
            </Text>

            <TextInput
              style={[
                styles.deleteModalInput,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: inputText,
                },
              ]}
              placeholder={t("settings.deleteAccountPasswordPlaceholder")}
              placeholderTextColor="#6b7280"
              value={deletePasswordInput}
              onChangeText={(text) => {
                setDeletePasswordInput(text);
                if (deleteError) setDeleteError("");
              }}
              secureTextEntry
            />

            {deleteError ? (
              <Text style={styles.deleteModalError}>{deleteError}</Text>
            ) : null}

            <View style={styles.deleteModalButtonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonGhost, { flex: 1 }]}
                onPress={() => {
                  setShowDeleteConfirmModal(false);
                  setDeletePasswordInput("");
                  setDeleteError("");
                }}
              >
                <Text style={styles.buttonGhostText}>{t("common.cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonDanger, { flex: 1 }]}
                onPress={confirmDeleteWithPassword}
              >
                <Text style={styles.buttonText}>
                  {t("settings.deleteAccountButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 4,
  },
  chipText: {
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  buttonPrimary: {
    backgroundColor: "#22c55e",
  },
  buttonSecondaryLight: {
    backgroundColor: "#1f2937",
  },
  buttonWarning: {
    backgroundColor: "#f97316",
  },
  buttonDanger: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4b5563",
    justifyContent: "center",
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
    textAlign: "center",
  },
  buttonGhostText: {
    color: "#9ca3af",
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 6,
  },
  accountHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },
  accountUsername: {
    fontSize: 16,
    fontWeight: "600",
  },
  accountEmail: {
    fontSize: 13,
  },
  accountInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  infoTextBlock: {
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  helperTextDanger: {
    color: "#fca5a5",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  deleteModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 10,
  },

  deleteModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 13,
    marginBottom: 12,
  },
  deleteModalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  deleteModalError: {
    marginTop: 6,
    fontSize: 12,
    color: "#fca5a5",
    textAlign: "center",
  },
  deleteModalButtonsRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
});

export default SettingsScreen;
