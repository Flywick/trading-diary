import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccount } from "../../src/context/AccountContext";
import { useLanguage } from "../../src/context/LanguageContext";
import AgendaScreen from "../../src/screens/AgendaScreen";

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

const Home: React.FC = () => {
  const {
    activeAccount,
    isLoaded: isAccountLoaded,
    register,
    login,
  } = useAccount();
  const {
    language,
    setLanguage,
    isLoaded: isLangLoaded,
    hasChosenLanguage,
  } = useLanguage();

  const [showLangModal, setShowLangModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [mode, setMode] = useState<"choice" | "register" | "login">("choice");

  // Formulaire inscription
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Formulaire connexion
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const liveAge = getAgeFromBirthdate(birthdate);

  // Affichage du modal de langue au premier lancement
  useEffect(() => {
    if (isLangLoaded && !hasChosenLanguage) {
      setShowLangModal(true);
    } else {
      setShowLangModal(false);
    }
  }, [isLangLoaded, hasChosenLanguage]);

  // Affichage du modal de compte une fois la langue choisie
  useEffect(() => {
    if (isAccountLoaded && hasChosenLanguage && !activeAccount) {
      setShowAccountModal(true);
      setMode("choice");
    } else if (activeAccount) {
      setShowAccountModal(false);
    }
  }, [isAccountLoaded, hasChosenLanguage, activeAccount]);

  const handleRegisterSubmit = () => {
    const uname = username.trim();
    const bdate = birthdate.trim();
    const mail = email.trim();
    const pwd = password;

    if (!uname || !bdate || !mail || !pwd || !passwordConfirm) {
      Alert.alert(
        "Champs manquants",
        "Tous les champs sont obligatoires pour créer un compte."
      );
      return;
    }

    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(bdate)) {
      Alert.alert(
        "Format de date invalide",
        "Merci d'entrer la date de naissance au format AAAA-MM-JJ (ex : 1995-04-23)."
      );
      return;
    }

    const age = getAgeFromBirthdate(bdate);
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
    if (!emailRegex.test(mail)) {
      Alert.alert(
        "Email invalide",
        "Merci d'entrer une adresse email valide."
      );
      return;
    }

    if (pwd.length < 6) {
      Alert.alert(
        "Mot de passe trop court",
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (pwd !== passwordConfirm) {
      Alert.alert(
        "Confirmation",
        "La confirmation du mot de passe ne correspond pas."
      );
      return;
    }

    try {
      register({
        username: uname,
        birthdate: bdate,
        email: mail,
        password: pwd,
      });

      setUsername("");
      setBirthdate("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setShowAccountModal(false);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de créer le compte.");
    }
  };

  const handleLoginSubmit = () => {
    const ident = loginIdentifier.trim();
    const pwd = loginPassword;

    if (!ident || !pwd) {
      Alert.alert(
        "Champs manquants",
        "Merci d'entrer ton pseudo/email et ton mot de passe."
      );
      return;
    }

    try {
      login(ident, pwd);
      setLoginIdentifier("");
      setLoginPassword("");
      setShowAccountModal(false);
    } catch (e: any) {
      Alert.alert("Erreur de connexion", e?.message ?? "Identifiants incorrects.");
    }
  };

  const renderChoice = () => (
    <View>
      <Text style={styles.title}>
        {language === "en"
          ? "Welcome to Trading Diary 📈"
          : "Bienvenue dans Trading Diary 📈"}
      </Text>
      <Text style={styles.subtitle}>
        {language === "en"
          ? "A journal built for serious traders: agenda, stats, RR, emotions, screenshots, and more."
          : "Un journal pensé pour les traders sérieux : agenda, stats, RR, émotions, screenshots, et plus encore."}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={() => setMode("register")}
      >
        <Text style={styles.buttonText}>
          {language === "en" ? "Create an account" : "Créer un compte"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => setMode("login")}
      >
        <Text style={styles.buttonText}>
          {language === "en" ? "Log in" : "Se connecter"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegister = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {language === "en" ? "Create an account" : "Créer un compte"}
      </Text>
      <Text style={styles.subtitle}>
        {language === "en"
          ? "One account per trader, multiple accounts on the same device."
          : "Un compte par trader, plusieurs comptes possibles sur le même appareil."}
      </Text>

      <Text style={styles.label}>
        {language === "en" ? "Username *" : "Pseudo *"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={language === "en" ? "Your username" : "Ton pseudo"}
        placeholderTextColor="#6b7280"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>
        {language === "en"
          ? "Birthdate * (YYYY-MM-DD)"
          : "Date de naissance * (AAAA-MM-JJ)"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={language === "en" ? "1995-04-23" : "1995-04-23"}
        placeholderTextColor="#6b7280"
        value={birthdate}
        onChangeText={(text) => setBirthdate(formatBirthdate(text))}
        keyboardType="numeric"
      />
      {liveAge !== null && (
        <Text style={styles.helperText}>
          {liveAge} {language === "en" ? "years old" : "ans"}
        </Text>
      )}

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        {language === "en" ? "Password *" : "Mot de passe *"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>
        {language === "en"
          ? "Confirm password *"
          : "Confirmer le mot de passe *"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#6b7280"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={handleRegisterSubmit}
      >
        <Text style={styles.buttonText}>
          {language === "en" ? "Create account" : "Créer le compte"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonGhost]}
        onPress={() => setMode("choice")}
      >
        <Text style={styles.buttonGhostText}>⟵ {language === "en" ? "Back" : "Retour"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLogin = () => (
    <View>
      <Text style={styles.title}>
        {language === "en" ? "Log in" : "Se connecter"}
      </Text>
      <Text style={styles.subtitle}>
        {language === "en"
          ? "Enter your username or email, then your password."
          : "Entre ton pseudo ou ton email, puis ton mot de passe."}
      </Text>

      <Text style={styles.label}>
        {language === "en" ? "Username or email" : "Pseudo ou email"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={language === "en" ? "Username or email" : "Pseudo ou email"}
        placeholderTextColor="#6b7280"
        value={loginIdentifier}
        onChangeText={setLoginIdentifier}
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        {language === "en" ? "Password" : "Mot de passe"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#6b7280"
        value={loginPassword}
        onChangeText={setLoginPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={handleLoginSubmit}
      >
        <Text style={styles.buttonText}>
          {language === "en" ? "Log in" : "Se connecter"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonGhost]}
        onPress={() => setMode("choice")}
      >
        <Text style={styles.buttonGhostText}>⟵ {language === "en" ? "Back" : "Retour"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <AgendaScreen />

      {/* MODAL CHOIX DE LANGUE */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              Choisis ta langue / Choose your language
            </Text>
            <Text style={styles.subtitle}>
              Tu pourras changer la langue plus tard dans les paramètres.
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                setLanguage("fr");
                setShowLangModal(false);
              }}
            >
              <Text style={styles.buttonText}>Français</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                setLanguage("en");
                setShowLangModal(false);
              }}
            >
              <Text style={styles.buttonText}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL BIENVENUE / COMPTE */}
      <Modal visible={showAccountModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            {mode === "choice"
              ? renderChoice()
              : mode === "register"
              ? renderRegister()
              : renderLogin()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  title: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 12,
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 2,
  },
  helperText: {
    color: "#9ca3af",
    fontSize: 12,
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
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#22c55e",
  },
  buttonSecondary: {
    backgroundColor: "#1d4ed8",
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#020617",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonGhostText: {
    color: "#9ca3af",
    fontWeight: "500",
    fontSize: 13,
  },
});

export default Home;
