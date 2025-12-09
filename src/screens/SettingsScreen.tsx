import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccount } from "../context/AccountContext";
import { useJournal } from "../context/JournalContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useTrades } from "../context/TradesContext";

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

const SettingsScreen: React.FC = () => {
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
  const { language, setLanguage } = useLanguage();

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

    // Réinitialiser le modal de suppression si changement de compte
    setShowDeleteConfirmModal(false);
    setDeletePasswordInput("");
    setDeleteError("");
  }, [activeAccount]);

  const liveAge = getAgeFromBirthdate(birthdateInput);
  const accountAge = activeAccount
    ? getAgeFromBirthdate(activeAccount.birthdate)
    : null;

  const t = (fr: string, en: string) => (language === "en" ? en : fr);

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
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
      return;
    }

    const username = usernameInput.trim();
    const birthdate = birthdateInput.trim();
    const email = emailInput.trim();

    if (!username || !birthdate || !email) {
      Alert.alert(
        "Informations manquantes",
        "Le pseudo, la date de naissance et l'email sont obligatoires."
      );
      return;
    }

    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(birthdate)) {
      Alert.alert(
        "Format de date invalide",
        "Merci d'entrer la date de naissance au format AAAA-MM-JJ (ex : 1995-04-23)."
      );
      return;
    }

    const age = getAgeFromBirthdate(birthdate);
    if (age === null) {
      Alert.alert("Date invalide", "La date de naissance ne semble pas valide.");
      return;
    }
    if (age < 18) {
      Alert.alert(
        "Âge insuffisant",
        "Tu dois avoir au moins 18 ans pour utiliser cette application."
      );
      return;
    }

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Email invalide",
        "Merci d'entrer une adresse email valide."
      );
      return;
    }

    updateActiveAccount({
      username,
      birthdate,
      email,
    });

    setIsEditingAccount(false);

    Alert.alert("Compte mis à jour", "Tes informations ont été enregistrées.");
  };

  const handleChangePassword = () => {
    if (!activeAccount) {
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
      return;
    }

    if (!activeAccount.password) {
      Alert.alert(
        "Mot de passe non défini",
        "Ce compte n'a pas encore de mot de passe local. Déconnecte-toi et reconnecte-toi en mode sécurisé pour le définir."
      );
      return;
    }

    const currentPassword = currentPasswordInput.trim();
    const newPassword = newPasswordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        "Champs manquants",
        "Tous les champs du mot de passe sont obligatoires."
      );
      return;
    }

    if (currentPassword !== activeAccount.password) {
      Alert.alert("Mot de passe incorrect", "L'ancien mot de passe est incorrect.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Mot de passe trop court",
        "Choisis un mot de passe d'au moins 6 caractères."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Confirmation incorrecte",
        "La confirmation du mot de passe ne correspond pas."
      );
      return;
    }

    updateActiveAccount({ password: newPassword } as any);

    setIsEditingPassword(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");

    Alert.alert("Mot de passe mis à jour", "Ton mot de passe a été modifié.");
  };

  const handleExportCsv = async () => {
    if (!activeAccount) {
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
      return;
    }

    if (!trades || trades.length === 0) {
      Alert.alert(
        "Aucun trade",
        "Tu n'as pas encore de trade dans le journal actif."
      );
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

      for (const t of trades) {
        const row = [
          escapeCsv(t.id),
          escapeCsv(t.date),
          escapeCsv(t.time),
          escapeCsv(t.instrument),
          escapeCsv(t.direction),
          escapeCsv(
            typeof t.pnl === "number" ? t.pnl.toString().replace(".", ",") : ""
          ),
          escapeCsv(
            typeof t.rr === "number" ? t.rr.toString().replace(".", ",") : ""
          ),
          escapeCsv(
            typeof t.lotSize === "number"
              ? t.lotSize.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof t.entryPrice === "number"
              ? t.entryPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof t.tpPrice === "number"
              ? t.tpPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(
            typeof t.slPrice === "number"
              ? t.slPrice.toString().replace(".", ",")
              : ""
          ),
          escapeCsv(t.emotion ?? ""),
          escapeCsv(t.quality ?? ""),
          escapeCsv(
            typeof t.respectPlan === "boolean"
              ? t.respectPlan
                ? "oui"
                : "non"
              : ""
          ),
          escapeCsv(t.comment ?? ""),
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
          dialogTitle: "Exporter les trades en CSV",
        });
      } else {
        Alert.alert(
          "Export terminé",
          "Le fichier CSV a été créé dans le stockage de l'application."
        );
      }
    } catch (error) {
      console.error("Erreur export CSV", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue pendant l'export des trades."
      );
    }
  };

  const handleExportJson = async () => {
    if (!activeAccount) {
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
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
          dialogTitle: "Exporter les données en JSON",
        });
      } else {
        Alert.alert(
          "Export terminé",
          "Le fichier JSON a été créé dans le stockage de l'application."
        );
      }
    } catch (error) {
      console.error("Erreur export JSON", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue pendant l'export des données."
      );
    }
  };

  const handleImportJson = async () => {
    if (!activeAccount) {
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      // Nouveau format (Expo SDK 50+)
      // @ts-ignore
      if (result.canceled) {
        return;
      }

      // @ts-ignore
      const asset = result.assets && result.assets[0];
      if (!asset || !asset.uri) {
        Alert.alert("Erreur", "Impossible de lire le fichier sélectionné.");
        return;
      }

      const content = await FileSystem.readAsStringAsync(asset.uri);
      let data: any;
      try {
        data = JSON.parse(content);
      } catch (e) {
        Alert.alert("Fichier invalide", "Le fichier sélectionné n'est pas un JSON valide.");
        return;
      }

      if (!data || typeof data !== "object") {
        Alert.alert("Fichier invalide", "Le contenu du fichier est invalide.");
        return;
      }

      // Mettre à jour le compte (sans toucher à l'id)
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

      // Mettre à jour les settings
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

      // Sauvegarder journaux & trades dans AsyncStorage pour ce compte
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
        "Import terminé",
        "Les données ont été importées. Redémarre l'application pour recharger complètement les journaux et les trades."
      );
    } catch (error) {
      console.error("Erreur import JSON", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue pendant l'import des données."
      );
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      "Réinitialiser l'application",
      "Tu vas supprimer tous les trades de tous tes profils (journaux) pour ce compte.\n\nTes profils et ton compte seront conservés.\n\nContinuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, réinitialiser",
          style: "destructive",
          onPress: () => {
            resetTrades();
            Alert.alert(
              "Réinitialisation terminée",
              "Tous les trades ont été supprimés pour ce compte."
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!activeAccount) {
      Alert.alert("Aucun compte", "Tu n'es connecté à aucun compte.");
      return;
    }

    Alert.alert(
      "Supprimer le compte",
      "Tu es sur le point de supprimer ce compte ET tous les trades associés sur cet appareil. Cette action est irréversible.\n\nContinuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Continuer",
          style: "destructive",
          onPress: () => {
            // On ouvre le modal de confirmation par mot de passe
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
      setDeleteError("Merci d'entrer ton mot de passe.");
      return;
    }

    if (entered !== activeAccount.password) {
      setDeleteError("Mot de passe incorrect.");
      return;
    }

    // Mot de passe correct : on affiche le message final puis on supprime
    Alert.alert(
      "Compte supprimé",
      "Le compte et toutes ses données ont été supprimés.",
      [
        {
          text: "OK",
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
    Alert.alert("Aucun compte", "Tu n'es connecté à aucun compte.");
    return;
  }

  Alert.alert(
    "Déconnexion",
    "Tu vas être déconnecté de ce compte. Tes trades et tes stats resteront liés à ce compte sur cet appareil. Continuer ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: () => {
          // 1️⃣ On affiche d’abord le message de confirmation
          Alert.alert(
            "Déconnecté",
            "Tu es maintenant déconnecté.",
            [
              {
                text: "OK",
                onPress: () => {
                  // 2️⃣ Et seulement quand l’utilisateur appuie sur OK,
                  // on fait vraiment le logout.
                  logout();
                },
              },
            ]
          );
        },
      },
    ]
  );
};


  const getInitial = (name: string | undefined) => {
    if (!name || name.length === 0) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: screenBg }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* SECTION COMPTE */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>
        {t("Compte", "Account")}
      </Text>

      {isEditingAccount ? (
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.subTitle, { color: mainText }]}>
            Modifier le compte
          </Text>

          <Text style={[styles.label, { color: subText }]}>Pseudo *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: inputBorder,
                color: inputText,
              },
            ]}
            placeholder="Ton pseudo"
            placeholderTextColor="#6b7280"
            value={usernameInput}
            onChangeText={setUsernameInput}
          />

          <Text style={[styles.label, { color: subText }]}>
            Date de naissance * (AAAA-MM-JJ)
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
            placeholder="1995-04-23"
            placeholderTextColor="#6b7280"
            value={birthdateInput}
            onChangeText={(text) => setBirthdateInput(formatBirthdate(text))}
            keyboardType="numeric"
          />
          {liveAge !== null && (
            <Text style={[styles.helperText, { color: subText }]}>
              Âge calculé : {liveAge} ans
            </Text>
          )}

          <Text style={[styles.label, { color: subText }]}>Email *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: inputBorder,
                color: inputText,
              },
            ]}
            placeholder="ton.email@example.com"
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
            <Text style={styles.buttonText}>Enregistrer le compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGhost]}
            onPress={() => setIsEditingAccount(false)}
          >
            <Text style={styles.buttonGhostText}>Annuler</Text>
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
            Modifier le mot de passe
          </Text>

          <Text style={[styles.label, { color: subText }]}>
            Ancien mot de passe *
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
            placeholder="Ton mot de passe actuel"
            placeholderTextColor="#6b7280"
            value={currentPasswordInput}
            onChangeText={setCurrentPasswordInput}
            secureTextEntry
          />

          <Text style={[styles.label, { color: subText }]}>
            Nouveau mot de passe *
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
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#6b7280"
            value={newPasswordInput}
            onChangeText={setNewPasswordInput}
            secureTextEntry
          />

          <Text style={[styles.label, { color: subText }]}>
            Confirmer le mot de passe *
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
            placeholder="Confirme le mot de passe"
            placeholderTextColor="#6b7280"
            value={confirmPasswordInput}
            onChangeText={setConfirmPasswordInput}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Mettre à jour le mot de passe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGhost]}
            onPress={() => setIsEditingPassword(false)}
          >
            <Text style={styles.buttonGhostText}>Annuler</Text>
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
                {activeAccount?.username ?? "Compte local"}
              </Text>
              <Text style={[styles.accountEmail, { color: subText }]}>
                {activeAccount?.email ?? "Aucune adresse email renseignée"}
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
              {t(
                "Compte local sur cet appareil",
                "Local account on this device"
              )}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondaryLight]}
            onPress={() => setIsEditingAccount(true)}
          >
            <Text style={styles.buttonText}>Modifier les informations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondaryLight]}
            onPress={() => setIsEditingPassword(true)}
          >
            <Text style={styles.buttonText}>Modifier le mot de passe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGhost]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonGhostText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION PRÉFÉRENCES */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>
        Préférences
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <Text style={[styles.subTitle, { color: mainText }]}>Langue</Text>
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
                  color:
                    language === "fr" ? chipActiveText : mainText,
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
                  color:
                    language === "en" ? chipActiveText : mainText,
                },
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subTitle, { color: mainText }]}>Devise</Text>
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

        <Text style={[styles.subTitle, { color: mainText }]}>Thème</Text>
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
              Sombre
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
              Clair
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subTitle, { color: mainText }]}>
          Format de l'heure
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
              24h
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
              12h (AM/PM)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION VERSION */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>Version</Text>
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
          Trading Diary Free
        </Text>
        <Text style={[styles.label, { color: subText }]}>
          Notes tes trades en illimité sur cet appareil. Sauvegarde locale, sans
          compte en ligne obligatoire.
        </Text>
        <Text
          style={[
            styles.label,
            { marginTop: 6, color: subText },
          ]}
        >
          La version Pro (sauvegarde cloud, multi-appareils, export avancé,
          etc.) arrivera plus tard.
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
              "Trading Diary Pro",
              "La version Pro (avec sauvegarde cloud, multi-appareils, statistiques avancées, etc.) sera disponible dans une future mise à jour."
            );
          }}
        >
          <Text style={styles.buttonText}>Trading Diary Pro (bientôt)</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION EXPORT CSV */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>
        Export des trades (CSV)
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <Text style={[styles.label, { color: subText }]}>
          Exporte tous les trades du journal actif au format CSV sur cet
          appareil.
        </Text>
        <Text
          style={[
            styles.helperText,
            { marginBottom: 0, color: subText },
          ]}
        >
          Tu pourras ensuite ouvrir le fichier dans Excel, Google Sheets, etc.
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
          <Text style={styles.buttonText}>Exporter le journal en CSV</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION EXPORT / IMPORT JSON */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>
        Sauvegarde JSON (complet)
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <Text style={[styles.label, { color: subText }]}>
          Exporte ou importe un fichier JSON contenant ton compte, tes
          préférences, tes journaux et tes trades.
        </Text>
        <Text
          style={[
            styles.helperText,
            { marginBottom: 0, color: subText },
          ]}
        >
          Parfait pour faire une sauvegarde manuelle ou transférer tes données
          sur un autre appareil.
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
          <Text style={styles.buttonText}>Exporter en JSON</Text>
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
          <Text style={styles.buttonText}>Importer depuis un JSON</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION RÉINITIALISATION */}
      <Text style={[styles.sectionTitle, { color: mainText }]}>
        Données et réinitialisation
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonWarning]}
        onPress={handleResetApp}
      >
        <Text style={styles.buttonText}>
          Réinitialiser l'application (garder le compte)
        </Text>
      </TouchableOpacity>
      <Text style={[styles.helperText, { color: subText }]}>
        Supprime tous les trades et les statistiques mais conserve ton compte.
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>
          Supprimer le compte (et toutes les données)
        </Text>
      </TouchableOpacity>
      <Text style={styles.helperTextDanger}>
        Action définitive : toutes les données liées à ce compte sur cet
        appareil seront supprimées.
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
              Confirmer la suppression
            </Text>
            <Text style={[styles.deleteModalMessage, { color: subText }]}>
              Pour confirmer la suppression définitive de ce compte, entre ton
              mot de passe.
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
              placeholder="Mot de passe"
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
                <Text style={styles.buttonGhostText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonDanger, { flex: 1 }]}
                onPress={confirmDeleteWithPassword}
              >
                <Text style={styles.buttonText}>Supprimer le compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
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
    marginTop: 16,
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
    marginTop: 4,
    textAlign: "center",
  },
  helperTextDanger: {
    color: "#fca5a5",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  // 🔐 Styles du modal de confirmation mot de passe
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
