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
import { useI18n } from "../../src/i18n/useI18n";
import AgendaScreen from "../../src/screens/AgendaScreen";

const formatBirthdateISO = (text: string) => {
  // YYYY-MM-DD (EN)
  const cleaned = text.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
};

const formatBirthdateFR = (text: string) => {
  // DD-MM-YYYY (FR)
  const cleaned = text.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
};

const toBirthdateISO = (input: string, language: string): string | null => {
  const v = input.trim();

  if (language === "fr") {
    const frRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!frRegex.test(v)) return null;
    const [dd, mm, yyyy] = v.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(v)) return null;
  return v;
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
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  if (age < 0 || age > 120) return null;
  return age;
};

const getAgeFromBirthdateInput = (input: string, language: string): number | null => {
  const iso = toBirthdateISO(input, language);
  if (!iso) return null;
  return getAgeFromBirthdate(iso);
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
  const { t } = useI18n();

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

  const liveAge = getAgeFromBirthdateInput(birthdate, language);

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
      Alert.alert(t("auth.missingFieldsTitle"), t("auth.missingFieldsRegisterMessage"));
      return;
    }

    const isoBirthdate = toBirthdateISO(bdate, language);
    if (!isoBirthdate) {
      Alert.alert(t("auth.invalidBirthdateFormatTitle"), t("auth.invalidBirthdateFormatMessage"));
      return;
    }

    const age = getAgeFromBirthdate(isoBirthdate);
    if (age === null) {
      Alert.alert(t("auth.invalidBirthdateTitle"), t("auth.invalidBirthdateMessage"));
      return;
    }
    if (age < 18) {
      Alert.alert(t("auth.ageTooLowTitle"), t("auth.ageTooLowMessage"));
      return;
    }

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(mail)) {
      Alert.alert(t("auth.invalidEmailTitle"), t("auth.invalidEmailMessage"));
      return;
    }

    if (pwd.length < 6) {
      Alert.alert(t("auth.passwordTooShortTitle"), t("auth.passwordTooShortMessage"));
      return;
    }

    if (pwd !== passwordConfirm) {
      Alert.alert(t("auth.passwordConfirmTitle"), t("auth.passwordConfirmMessage"));
      return;
    }

    try {
      register({
        username: uname,
        birthdate: isoBirthdate,
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
      Alert.alert(t("auth.createAccountErrorTitle"), e?.message ?? t("auth.createAccountErrorMessage"));
    }
  };

  const handleLoginSubmit = () => {
    const email = loginIdentifier.trim();
    const pwd = loginPassword;

    if (!email || !pwd) {
      Alert.alert(t("auth.missingFieldsTitle"), t("auth.missingFieldsLoginMessage"));
      return;
    }

    try {
      login(email, pwd);
      setLoginIdentifier("");
      setLoginPassword("");
      setShowAccountModal(false);
    } catch (e: any) {
      Alert.alert(t("auth.loginErrorTitle"), e?.message ?? t("auth.loginErrorMessage"));
    }
  };

  const renderChoice = () => (
    <View>
      <Text style={styles.title}>
        {t("auth.welcomeTitle")}
      </Text>
      <Text style={styles.subtitle}>
        {t("auth.welcomeSubtitle")}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={() => setMode("register")}
      >
        <Text style={styles.buttonText}>
          {t("auth.createAccountButton")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => setMode("login")}
      >
        <Text style={styles.buttonText}>
          {t("auth.loginButton")}
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
        {t("auth.createAccountButton")}
      </Text>
      <Text style={styles.subtitle}>
        {t("auth.registerSubtitle")}
      </Text>

      <Text style={styles.label}>
        {t("auth.usernameLabel")} *
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.usernamePlaceholder")}
        placeholderTextColor="#6b7280"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>
        {t("auth.birthdateLabel")} * {t("auth.birthdateHint")}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.birthdatePlaceholder")}
        placeholderTextColor="#6b7280"
        value={birthdate}
        onChangeText={(text) =>
          setBirthdate(language === "fr" ? formatBirthdateFR(text) : formatBirthdateISO(text))
        }
        keyboardType="numeric"
      />
      {liveAge !== null && (
        <Text style={styles.helperText}>
          {t("auth.yearsOld", { age: liveAge })}
        </Text>
      )}

      <Text style={styles.label}>{t("auth.emailLabel")} *</Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.emailPlaceholder")}
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        {t("auth.passwordLabel")} *
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
        {t("auth.confirmPasswordLabel")} *
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
          {t("auth.createAccountSubmit")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonGhost]}
        onPress={() => setMode("choice")}
      >
        <Text style={styles.buttonGhostText}>
          ⟵ {t("auth.back")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLogin = () => (
    <View>
      <Text style={styles.title}>
        {t("auth.loginTitle")}
      </Text>
      <Text style={styles.subtitle}>
        {t("auth.loginSubtitle")}
      </Text>

      <Text style={styles.label}>{t("auth.loginIdentifierLabel")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.loginIdentifierPlaceholder")}
        placeholderTextColor="#6b7280"
        value={loginIdentifier}
        onChangeText={setLoginIdentifier}
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        {t("auth.loginPasswordLabel")}
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
          {t("auth.loginSubmit")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonGhost]}
        onPress={() => setMode("choice")}
      >
        <Text style={styles.buttonGhostText}>
          ⟵ {t("auth.back")}
        </Text>
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
              {t("auth.chooseLanguageTitle")}
            </Text>
            <Text style={styles.subtitle}>
              {t("auth.chooseLanguageSubtitle")}
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                setLanguage("fr");
                setShowLangModal(false);
              }}
            >
              <Text style={styles.buttonText}>{t("auth.french")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                setLanguage("en");
                setShowLangModal(false);
              }}
            >
              <Text style={styles.buttonText}>{t("auth.english")}</Text>
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