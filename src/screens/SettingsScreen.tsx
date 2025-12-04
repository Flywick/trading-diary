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
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useTrades } from "../context/TradesContext";

const formatBirthdate = (text: string) => {
  const cleaned = text.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
  }
};

const getAgeFromBirthdate = (birthdate: string): number | null => {
  const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!birthdateRegex.test(birthdate)) return null;

  const [yearStr, monthStr, dayStr] = birthdate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);

  const birth = new Date(year, month, day);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
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
  const { resetTrades } = useTrades();
  const {
    activeAccount,
    updateActiveAccount,
    deleteActiveAccount,
    logout,
  } = useAccount();
  const { language, setLanguage } = useLanguage();
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020617" : "#f9fafb";
  const cardBackground = isDark ? "#020617" : "#ffffff";
  const cardBorder = isDark ? "#111827" : "#e5e7eb";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const inputBackground = isDark ? "#020617" : "#ffffff";

  const [usernameInput, setUsernameInput] = useState(activeAccount?.username ?? "");
  const [birthdateInput, setBirthdateInput] = useState(activeAccount?.birthdate ?? "");
  const [emailInput, setEmailInput] = useState(activeAccount?.email ?? "");
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Édition mot de passe
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  const [liveAge, setLiveAge] = useState<number | null>(null);

  useEffect(() => {
    if (birthdateInput) {
      const age = getAgeFromBirthdate(birthdateInput);
      setLiveAge(age);
    } else {
      setLiveAge(null);
    }
  }, [birthdateInput]);

  useEffect(() => {
    if (activeAccount) {
      setUsernameInput(activeAccount.username);
      setBirthdateInput(activeAccount.birthdate);
      setEmailInput(activeAccount.email);
    }
  }, [activeAccount]);

  const handleSaveAccount = () => {
    if (!activeAccount) return;

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
        "Date invalide",
        "La date de naissance doit être au format AAAA-MM-JJ."
      );
      return;
    }

    const age = getAgeFromBirthdate(birthdate);
    if (age === null || age < 18) {
      Alert.alert(
        "Âge invalide",
        "Tu dois avoir au moins 18 ans pour utiliser l'application."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email invalide", "L'adresse email n'est pas valide.");
      return;
    }

    updateActiveAccount({
      username,
      birthdate,
      email,
    } as any);

    Alert.alert("Compte mis à jour", "Tes informations ont été enregistrées.");
    setIsEditingAccount(false);
  };

  const handleChangePassword = () => {
    if (!activeAccount) return;

    const current = currentPasswordInput.trim();
    const next = newPasswordInput.trim();
    const confirm = confirmPasswordInput.trim();

    if (!current || !next || !confirm) {
      Alert.alert(
        "Champs manquants",
        "Tous les champs de mot de passe sont obligatoires."
      );
      return;
    }

    const storedPassword = (activeAccount as any).password;
    if (storedPassword !== current) {
      Alert.alert(
        "Mot de passe incorrect",
        "L'ancien mot de passe ne correspond pas."
      );
      return;
    }

    if (next.length < 6) {
      Alert.alert(
        "Mot de passe trop court",
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (next !== confirm) {
      Alert.alert(
        "Confirmation incorrecte",
        "La confirmation du mot de passe ne correspond pas."
      );
      return;
    }

    updateActiveAccount({
      password: next,
    } as any);

    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    setIsEditingPassword(false);

    Alert.alert("Mot de passe mis à jour", "Ton mot de passe a été changé.");
  };

  const handleResetTrades = () => {
    Alert.alert(
      "Réinitialiser les trades",
      "Cette action va supprimer tous les trades de ce compte (tous journaux confondus). Tu es sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, supprimer",
          style: "destructive",
          onPress: () => {
            resetTrades();
            Alert.alert("Trades supprimés", "Tous les trades ont été effacés.");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!activeAccount) return;

    Alert.alert(
      "Supprimer le compte",
      "Cette action est définitive : le compte et tous les trades associés seront supprimés. Tu es sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, supprimer",
          style: "destructive",
          onPress: () => {
            resetTrades();
            deleteActiveAccount();
            Alert.alert("Compte supprimé", "Le compte a été supprimé.");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Tu veux vraiment te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui, déconnecter",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const accountAge =
    activeAccount && activeAccount.birthdate
      ? getAgeFromBirthdate(activeAccount.birthdate)
      : null;

  const getInitial = (name: string | undefined) => {
    if (!name || name.length === 0) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <ScrollView
      style={{ backgroundColor: bgColor }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* SECTION COMPTE */}
      <Text style={[styles.sectionTitle, { color: textPrimary }]}>Compte</Text>

      {!activeAccount ? (
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={[styles.value, { color: textPrimary }]}>
            Aucun compte connecté. Va sur l'écran d'accueil (Agenda) pour créer
            un compte ou te connecter.
          </Text>
        </View>
      ) : isEditingAccount ? (
        // --- ÉDITION COMPTE ---
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textSecondary }]}>Pseudo *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
            placeholder="Ton pseudo"
            placeholderTextColor="#6b7280"
            value={usernameInput}
            onChangeText={setUsernameInput}
          />

          <Text style={[styles.label, { color: textSecondary }]}>Date de naissance * (AAAA-MM-JJ)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
            placeholder="1995-04-23"
            placeholderTextColor="#6b7280"
            value={birthdateInput}
            onChangeText={(text) => setBirthdateInput(formatBirthdate(text))}
            keyboardType="numeric"
          />
          {liveAge !== null && (
            <Text style={[styles.value, { color: textPrimary }]}>{liveAge} ans</Text>
          )}

          <Text style={[styles.label, { color: textSecondary }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
            placeholder="email@example.com"
            placeholderTextColor="#6b7280"
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSaveAccount}
          >
            <Text style={styles.buttonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonGhost]}
            onPress={() => setIsEditingAccount(false)}
          >
            <Text style={styles.buttonGhostText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : isEditingPassword ? (
        // --- ÉDITION MOT DE PASSE ---
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={[styles.label, { color: textSecondary }]}>Ancien mot de passe *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
            placeholder="Ancien mot de passe"
            placeholderTextColor="#6b7280"
            value={currentPasswordInput}
            onChangeText={setCurrentPasswordInput}
            secureTextEntry
          />

          <Text style={[styles.label, { color: textSecondary }]}>Nouveau mot de passe *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
            placeholder="Nouveau mot de passe (min. 6 caractères)"
            placeholderTextColor="#6b7280"
            value={newPasswordInput}
            onChangeText={setNewPasswordInput}
            secureTextEntry
          />

          <Text style={[styles.label, { color: textSecondary }]}>Confirmer le mot de passe *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textPrimary, borderColor: cardBorder }]}
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
        // --- VUE NORMALE COMPTE ---
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          {/* Header avatar + pseudo + email */}
          <View style={styles.accountHeaderRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitial(activeAccount.username)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountUsername, { color: textPrimary }]}>
                {activeAccount.username}
              </Text>
              <Text style={[styles.accountEmail, { color: textSecondary }]}>
                {activeAccount.email}
              </Text>
            </View>
          </View>

          {/* Infos détaillées */}
          <View style={styles.accountInfoRow}>
            <View style={styles.infoTextBlock}>
              <Text style={[styles.label, { color: textSecondary }]}>Date de naissance</Text>
              <Text style={[styles.value, { color: textPrimary }]}>{activeAccount.birthdate}</Text>
            </View>
          </View>

          {accountAge !== null && (
            <View style={styles.accountInfoRow}>
              <View style={styles.infoTextBlock}>
                <Text style={[styles.label, { color: textSecondary }]}>Âge</Text>
                <Text style={[styles.value, { color: textPrimary }]}>{accountAge} ans</Text>
              </View>
            </View>
          )}

          <View style={styles.accountInfoRow}>
            <View style={styles.infoTextBlock}>
              <Text style={[styles.label, { color: textSecondary }]}>Compte créé le</Text>
              <Text style={[styles.value, { color: textPrimary }]}>
                {new Date(activeAccount.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Boutons compte */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setIsEditingAccount(true)}
          >
            <Text style={styles.buttonText}>Modifier le compte</Text>
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
      <Text style={[styles.sectionTitle, { color: textPrimary }]}>Préférences</Text>

      <Text style={[styles.subTitle, { color: textSecondary }]}>Langue</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            language === "fr" && styles.chipActive,
          ]}
          onPress={() => setLanguage("fr")}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>Français</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            language === "en" && styles.chipActive,
          ]}
          onPress={() => setLanguage("en")}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>English</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subTitle, { color: textSecondary }]}>Devise</Text>
      <View style={styles.row}>
        {["EUR", "USD", "GBP", "JPY"].map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              currency === c && styles.chipActive,
            ]}
            onPress={() => setCurrency(c as any)}
          >
            <Text style={[styles.chipText, { color: textPrimary }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subTitle, { color: textSecondary }]}>Thème</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            theme === "dark" && styles.chipActive,
          ]}
          onPress={() => setTheme("dark")}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>Sombre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
          theme === "light" && styles.chipActive,
          ]}
          onPress={() => setTheme("light")}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>Clair</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subTitle, { color: textSecondary }]}>Format de l'heure</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            timeFormat24h && styles.chipActive,
          ]}
          onPress={() => setTimeFormat24h(true)}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>24h</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            !timeFormat24h && styles.chipActive,
          ]}
          onPress={() => setTimeFormat24h(false)}
        >
          <Text style={[styles.chipText, { color: textPrimary }]}>12h</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION ABONNEMENT (placeholder futur) */}
      <Text style={[styles.sectionTitle, { color: textPrimary }]}>Abonnement</Text>
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
        <Text style={[styles.label, { color: textSecondary }]}>Formule actuelle</Text>
        <Text style={[styles.value, { color: textPrimary }]}>Version gratuite</Text>
        <Text style={[styles.label, { marginTop: 6, color: textSecondary }]}>
          À l'avenir, tu pourras peut-être débloquer :
        </Text>
        <Text style={styles.helperText}>
          • Plus de journaux / profils{"\n"}• Export avancé{"\n"}• Statistiques
          supplémentaires
        </Text>
      </View>

      {/* SECTION RÉINITIALISATION */}
      <Text style={[styles.sectionTitle, { color: textPrimary }]}>Données et réinitialisation</Text>
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
        <TouchableOpacity
          style={[styles.button, styles.buttonWarning]}
          onPress={handleResetTrades}
        >
          <Text style={styles.buttonText}>Réinitialiser les trades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Supprimer le compte</Text>
        </TouchableOpacity>

        <Text style={styles.helperTextDanger}>
          Attention, ces actions sont définitives.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  subTitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  label: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 2,
  },
  value: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#020617",
    color: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  chipActive: {
    backgroundColor: "rgba(52,211,153,0.18)",
    borderColor: "#34d399",
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  buttonPrimary: {
    backgroundColor: "#22c55e",
  },
  buttonSecondary: {
    backgroundColor: "#4b5563",
  },
  buttonSecondaryLight: {
    backgroundColor: "#374151",
  },
  buttonWarning: {
    backgroundColor: "#f97316",
  },
  buttonDanger: {
    backgroundColor: "#ef4444",
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  buttonGhostText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },
  helperText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 6,
  },
  helperTextDanger: {
    color: "#fca5a5",
    fontSize: 12,
    marginTop: 6,
  },
  accountHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
  },
  accountEmail: {
    color: "#9ca3af",
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
  helperTextCenter: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  helperTextDangerCenter: {
    color: "#fca5a5",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});

export default SettingsScreen;
