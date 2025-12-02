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

  const [usernameInput, setUsernameInput] = useState(activeAccount?.username ?? "");
  const [birthdateInput, setBirthdateInput] = useState(activeAccount?.birthdate ?? "");
  const [emailInput, setEmailInput] = useState(activeAccount?.email ?? "");
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Édition mot de passe
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  useEffect(() => {
    setUsernameInput(activeAccount?.username ?? "");
    setBirthdateInput(activeAccount?.birthdate ?? "");
    setEmailInput(activeAccount?.email ?? "");
    setIsEditingAccount(false);
    setIsEditingPassword(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
  }, [activeAccount]);

  const liveAge = getAgeFromBirthdate(birthdateInput);
  const accountAge = activeAccount
    ? getAgeFromBirthdate(activeAccount.birthdate)
    : null;

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
    Alert.alert(
      "Compte mis à jour",
      "Les informations du compte ont été mises à jour."
    );
  };

  const handleChangePassword = () => {
    if (!activeAccount) {
      Alert.alert(
        "Aucun compte",
        "Crée d'abord un compte depuis l'écran d'accueil."
      );
      return;
    }

    const currentPassword = currentPasswordInput.trim();
    const newPassword = newPasswordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        "Champs manquants",
        "Merci de remplir tous les champs de mot de passe."
      );
      return;
    }

    // Pour éviter l'erreur TypeScript sur "password" on caste en any.
    const currentStoredPassword = (activeAccount as any).password as
      | string
      | undefined;

    if (currentStoredPassword && currentPassword !== currentStoredPassword) {
      Alert.alert(
        "Mot de passe incorrect",
        "L'ancien mot de passe ne correspond pas."
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Mot de passe trop court",
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
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

    // idem, cast en any pour éviter l'erreur de type si password n'est pas encore dans l'interface Account
    updateActiveAccount({ password: newPassword } as any);

    setIsEditingPassword(false);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");

    Alert.alert("Mot de passe mis à jour", "Ton mot de passe a été modifié.");
  };

  const handleResetApp = () => {
    Alert.alert(
      "Réinitialiser l'application",
      "Tu es sur le point de supprimer toutes les données de l'application (trades, stats, etc.), mais ton compte sera conservé. Cette action est irréversible. Continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, réinitialiser",
          style: "destructive",
          onPress: () => {
            resetTrades();
            Alert.alert(
              "Réinitialisé",
              "Toutes les données (hors compte) ont été effacées."
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!activeAccount) {
      Alert.alert("Aucun compte", "Il n'y a aucun compte à supprimer.");
      return;
    }

    Alert.alert(
      "Supprimer le compte",
      "Cette action va supprimer ton compte et toutes les données associées (trades, stats, paramètres). Rien ne sera conservé. Es-tu sûr de vouloir continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer tout",
          style: "destructive",
          onPress: () => {
            resetTrades();
            deleteActiveAccount();
            Alert.alert(
              "Compte supprimé",
              "Le compte et toutes les données ont été effacés."
            );
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
            logout();
            Alert.alert("Déconnecté", "Tu es maintenant déconnecté.");
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
    <ScrollView
      style={{ backgroundColor: theme === "dark" ? "#020617" : "#f1f5f9" }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* SECTION COMPTE */}
      <Text style={styles.sectionTitle}>Compte</Text>

      {!activeAccount ? (
        <View style={styles.card}>
          <Text style={styles.value}>
            Aucun compte connecté. Va sur l'écran d'accueil (Agenda) pour créer
            un compte ou te connecter.
          </Text>
        </View>
      ) : isEditingAccount ? (
        // --- ÉDITION COMPTE ---
        <View style={styles.card}>
          <Text style={styles.label}>Pseudo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ton pseudo"
            placeholderTextColor="#6b7280"
            value={usernameInput}
            onChangeText={setUsernameInput}
          />

          <Text style={styles.label}>Date de naissance * (AAAA-MM-JJ)</Text>
          <TextInput
            style={styles.input}
            placeholder="1995-04-23"
            placeholderTextColor="#6b7280"
            value={birthdateInput}
            onChangeText={(text) => setBirthdateInput(formatBirthdate(text))}
            keyboardType="numeric"
          />
          {liveAge !== null && (
            <Text style={styles.value}>{liveAge} ans</Text>
          )}

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
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
        <View style={styles.card}>
          <Text style={styles.label}>Ancien mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ancien mot de passe"
            placeholderTextColor="#6b7280"
            value={currentPasswordInput}
            onChangeText={setCurrentPasswordInput}
            secureTextEntry
          />

          <Text style={styles.label}>Nouveau mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#6b7280"
            value={newPasswordInput}
            onChangeText={setNewPasswordInput}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <TextInput
            style={styles.input}
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
        // --- VUE COMPTE CLASSIQUE ---
        <View style={styles.card}>
          {/* Header avatar + pseudo + email */}
          <View style={styles.accountHeaderRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitial(activeAccount.username)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountUsername}>
                {activeAccount.username}
              </Text>
              <Text style={styles.accountEmail}>
                {activeAccount.email}
              </Text>
            </View>
          </View>

          {/* Infos détaillées */}
          <View style={styles.accountInfoRow}>
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Date de naissance</Text>
              <Text style={styles.value}>{activeAccount.birthdate}</Text>
            </View>
          </View>

          {accountAge !== null && (
            <View style={styles.accountInfoRow}>
              <View style={styles.infoTextBlock}>
                <Text style={styles.label}>Âge</Text>
                <Text style={styles.value}>{accountAge} ans</Text>
              </View>
            </View>
          )}

          <View style={styles.accountInfoRow}>
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Compte créé le</Text>
              <Text style={styles.value}>
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
      <Text style={styles.sectionTitle}>Préférences</Text>

      <Text style={styles.subTitle}>Langue</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            language === "fr" && styles.chipActive,
          ]}
          onPress={() => setLanguage("fr")}
        >
          <Text style={styles.chipText}>Français</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            language === "en" && styles.chipActive,
          ]}
          onPress={() => setLanguage("en")}
        >
          <Text style={styles.chipText}>English</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Devise</Text>
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
            <Text style={styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subTitle}>Thème</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            theme === "dark" && styles.chipActive,
          ]}
          onPress={() => setTheme("dark")}
        >
          <Text style={styles.chipText}>Sombre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            theme === "light" && styles.chipActive,
          ]}
          onPress={() => setTheme("light")}
        >
          <Text style={styles.chipText}>Clair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Format de l'heure</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.chip,
            timeFormat24h && styles.chipActive,
          ]}
          onPress={() => setTimeFormat24h(true)}
        >
          <Text style={styles.chipText}>24h</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            !timeFormat24h && styles.chipActive,
          ]}
          onPress={() => setTimeFormat24h(false)}
        >
          <Text style={styles.chipText}>12h</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION ABONNEMENT */}
      <Text style={styles.sectionTitle}>Abonnement</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Formule actuelle</Text>
        <Text
          style={[
            styles.value,
            { fontWeight: "600", marginBottom: 4 },
          ]}
        >
          Trading Diary Free
        </Text>
        <Text style={styles.label}>
          Notes tes trades en illimité sur cet appareil. Sauvegarde locale, sans
          compte en ligne obligatoire.
        </Text>
        <Text style={[styles.label, { marginTop: 6 }]}>
          La version Pro (sauvegarde cloud, multi-appareils, export avancé, etc.)
          arrivera plus tard.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondaryLight, { marginTop: 12 }]}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              "Trading Diary Pro",
              "La version Pro (avec sauvegarde cloud, multi-appareils et d'autres options) sera disponible dans une future mise à jour."
            );
          }}
        >
          <Text style={styles.buttonText}>Trading Diary Pro (bientôt)</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION RÉINITIALISATION */}
      <Text style={styles.sectionTitle}>Données et réinitialisation</Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonWarning]}
        onPress={handleResetApp}
      >
        <Text style={styles.buttonText}>
          Réinitialiser l'application (garder le compte)
        </Text>
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Supprime tous les trades et les statistiques mais conserve ton compte.
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>
          ⚠️ Supprimer le compte et toutes les données ⚠️
        </Text>
      </TouchableOpacity>
      <Text style={styles.helperTextDanger}>
        Action définitive : supprime le compte, les trades, les statistiques et
        les paramètres. Impossible de revenir en arrière.
      </Text>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#111827",
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
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
    marginTop: 4,
  },
  chipActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#60a5fa",
  },
  chipText: {
    color: "#e5e7eb",
    fontSize: 12,
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
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
  },

  // Compte : header + avatar
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

  helperText: {
    color: "#9ca3af",
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
});

export default SettingsScreen;
