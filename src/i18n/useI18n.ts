// src/i18n/useI18n.ts
import { useLanguage } from "../context/LanguageContext";

// --------------------------------------------------
// FRANÇAIS
// --------------------------------------------------

const fr = {
  // tableau abrégé des jours (Lun → Dim)
  weekdaysShort: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],

  common: {
    cancel: "Annuler",
    ok: "OK",
    delete: "Supprimer",
    edit: "Modifier",
    close: "Fermer",
  },

  // --------------------- AGENDA ---------------------
  agenda: {
    title: "Agenda",
    noJournal: "Aucun journal actif",
    trades: "trades",
    today: "Aujourd’hui",
    monthNext: "Mois suivant",
    monthPrev: "Mois précédent",

    profileLabel: "Journal",
    monthResultLabel: "Résultat du mois",
    winrateLabel: "Winrate",

    // Modal profils
    profilesTitle: "Profils / journaux",
    profileActiveBadge: "Actif",
    renameActiveProfileLabel: "Renommer le journal actif",
    saveProfileNameButton: "Enregistrer le nom",
    deleteActiveProfileButton: "Supprimer ce journal",
    newProfileLabel: "Nouveau journal",
    newProfilePlaceholder: "Nom du nouveau journal",
    createAndActivateButton: "Créer et activer",
    profilePlaceholder: "Sélectionne un journal",
    returnToCurrentMonth: "Revenir au mois actuel",

    cannotDeleteLastProfileTitle: "Suppression impossible",
    cannotDeleteLastProfileMessage:
      "Tu dois avoir au moins un journal actif. Crée un nouveau journal avant de supprimer celui-ci.",

    deleteProfileTitle: "Supprimer le journal",
    deleteProfileMessage:
      'Voulez-vous vraiment supprimer le journal "{{name}}" ? Cette action est définitive.',
  },

  // ---------------- DAY SUMMARY ---------------------
  daySummary: {
    tradeDetailsTitle: "Trade",
    editTrade: "Modifier le trade",
    deleteTrade: "Supprimer le trade",
    noTrades: 'Aucun trade ce jour. Appuie sur "+" pour ajouter un trade.',
    totalPnl: "Résultat total",
    avgRr: "RR moyen",
    tradesCount: "Trades",
    actionQuestion: "Que veux-tu faire avec ce trade ?",
  },

  // ------------------ SETTINGS ----------------------
  settings: {
    // sections
    accountSectionTitle: "Compte",
    preferencesSectionTitle: "Préférences",
    exportCsvSectionTitle: "Exporter en CSV",
    exportJsonSectionTitle: "Export / Import JSON",
    resetSectionTitle: "Réinitialisation",
    versionSectionTitle: "Version",

    // ✅ NEW (V1)
    helpSectionTitle: "Aide",
    legalPrivacyButton: "CGU & Confidentialité",
    supportButton: "Support",
    suggestionsButton: "Suggestions",
    helpEmailNote: "Contact : {{email}}",
    supportErrorTitle: "Impossible d’ouvrir l’email",
    supportErrorMessage: "Aucune application mail disponible sur cet appareil.",

    // account display
    accountLocalInfo: "Compte local",
    noEmailFallback: "Aucune adresse email renseignée",

    // edit account
    editAccountButton: "Modifier le compte",
    saveAccountButton: "Enregistrer les modifications",
    usernameLabel: "Nom d’utilisateur",
    birthdateLabel: "Date de naissance",
    emailLabel: "Adresse email",
    usernamePlaceholder: "Ton pseudo",
    birthdatePlaceholder: "JJ-MM-AAAA",
    emailPlaceholder: "ton.email@example.com",

    accountInfosMissingTitle: "Informations manquantes",
    accountInfosMissingMessage:
      "Veuillez remplir tous les champs obligatoires.",
    accountInvalidBirthdateTitle: "Date invalide",
    accountInvalidBirthdateMessage:
      "Veuillez entrer une date au format JJ-MM-AAAA.",
    accountUpdatedTitle: "Compte mis à jour",
    accountUpdatedMessage:
      "Les informations de votre compte ont été modifiées.",

    passwordNotDefinedTitle: "Mot de passe non défini",
    passwordNotDefinedMessage:
      "Ce compte n’a pas encore de mot de passe local. Déconnecte-toi puis reconnecte-toi pour définir un mot de passe.",
    editPasswordButton: "Modifier le mot de passe",
    currentPasswordLabel: "Mot de passe actuel",
    newPasswordLabel: "Nouveau mot de passe",
    confirmNewPasswordLabel: "Confirmation du mot de passe",
    currentPasswordPlaceholder: "Ton mot de passe actuel",
    newPasswordPlaceholder: "Nouveau mot de passe",
    confirmPasswordPlaceholder: "Confirme le mot de passe",
    passwordIncorrect: "Mot de passe incorrect",
    passwordUpdatedTitle: "Mot de passe mis à jour",
    passwordUpdatedMessage: "Votre mot de passe a été modifié.",

    // themes / language / currency
    languageSectionTitle: "Langue",
    currencySectionTitle: "Devise",
    themeSectionTitle: "Thème",
    themeDark: "Sombre",
    themeLight: "Clair",
    timeFormatSectionTitle: "Format de l’heure",
    format24h: "24h",
    format12h: "12h",

    // logout
    logoutTitle: "Déconnexion",
    logoutMessage: "Voulez-vous vous déconnecter ?",
    logoutButton: "Se déconnecter",
    logoutDoneTitle: "Déconnecté",
    logoutDoneMessage: "Vous avez été déconnecté.",

    // delete account
    deleteAccountTitle: "Supprimer le compte",
    deleteAccountMessage: "Voulez-vous vraiment supprimer ce compte ?",
    deleteAccountConfirm: "Supprimer",
    deleteAccountButton: "Supprimer le compte",
    deleteAccountWarning:
      "Action définitive : toutes les données liées à ce compte seront supprimées.",
    deleteAccountNoAccount: "Aucun compte actif",

    deleteAccountModalTitle: "Confirmation requise",
    deleteAccountModalMessage:
      "Pour confirmer la suppression, entrez votre mot de passe.",
    deleteAccountPasswordPlaceholder: "Mot de passe",
    deleteAccountPasswordErrorEmpty: "Veuillez entrer votre mot de passe.",
    deleteAccountPasswordErrorWrong: "Mot de passe incorrect.",
    deleteAccountFinalTitle: "Suppression confirmée",
    deleteAccountFinalMessage: "Le compte va être supprimé.",

    // export CSV
    exportCsvDescription: "Exportez tous vos trades au format CSV.",
    exportCsvHelper:
      "Vous pourrez ouvrir le fichier dans Excel, Google Sheets, etc.",
    exportCsvButton: "Exporter en CSV",
    exportCsvDoneTitle: "Export terminé",
    exportCsvDoneMessage: "Le fichier CSV a été généré.",
    exportCsvErrorTitle: "Erreur d’export",
    exportCsvErrorMessage: "Impossible de générer le fichier CSV.",

    // export / import JSON
    exportJsonDescription: "Sauvegardez votre compte, journaux et trades.",
    exportJsonHelper:
      "Idéal pour transférer vos données sur un autre appareil.",
    exportJsonButton: "Exporter en JSON",
    importJsonButton: "Importer un fichier JSON",
    importJsonDoneTitle: "Import réussi",
    importJsonDoneMessage: "Vos données ont été restaurées.",
    importJsonErrorTitle: "Erreur d’import",
    importJsonErrorMessage: "Impossible d’importer ce fichier.",
    exportJsonInvalidFileTitle: "Fichier invalide",
    exportJsonInvalidFileMessage:
      "Le fichier sélectionné n’est pas un JSON valide.",
    importJsonInvalidFileTitle: "Fichier invalide",
    importJsonInvalidFileMessage:
      "Le fichier sélectionné n’est pas un JSON valide.",
    importJsonInvalidContentMessage:
      "Le contenu du fichier n’est pas compatible avec l’application.",

    // reset
    resetAppTitle: "Réinitialiser les données",
    resetAppMessage:
      "Toutes les statistiques et trades seront supprimés. Continuer ?",
    resetAppConfirm: "Réinitialiser",
    resetAppDoneTitle: "Réinitialisation effectuée",
    resetAppDoneMessage: "Les données ont été supprimées.",
    resetTradesButton: "Réinitialiser les trades",
    resetTradesHelper:
      "Supprime tous les trades et statistiques mais conserve votre compte.",

    // version
    versionName: "Trading Diary — version locale",
    versionDescription:
      "Toutes les données sont stockées sur votre appareil.\n\n" +
      "La version Pro apportera de nouvelles fonctionnalités pour les abonnés et arrivera avec la V2.\n\n" +
      "En attendant, vous pouvez soutenir le projet avec des dons.",

    donationButton: "Faire un don",
    donationAlertTitle: "Soutenir le projet",
    donationAlertMessage:
      "Merci pour votre soutien 🙏\n\nLes dons permettent de financer le développement et les futures fonctionnalités.",
  },

  // ✅ LEGAL — CGU / PRIVACY (V1 - Google Play ready)
  legal: {
    title: "CGU & Confidentialité",
    lastUpdated: "Dernière mise à jour : 14/01/2026",

    // ---------------- CONFIDENTIALITÉ ----------------
    privacyTitle: "Politique de confidentialité",
    privacyBody:
      "Trading Diary respecte votre vie privée. Toutes les données saisies dans l’application (trades, statistiques, paramètres) sont stockées exclusivement sur votre appareil.\n\n" +
      "Aucune donnée personnelle n’est collectée, transmise à un serveur, partagée avec des tiers ou utilisée à des fins de suivi, de publicité ou d’analyse.\n\n" +
      "L’application fonctionne entièrement hors ligne et ne nécessite aucune création de compte en ligne.",

    // ---------------- DONNÉES & SÉCURITÉ ----------------
    dataSecurityTitle: "Sécurité des données",
    dataSecurityBody:
      "Vous êtes seul responsable de la sauvegarde et de la conservation de vos données. En cas de désinstallation de l’application ou de perte de l’appareil, les données locales peuvent être définitivement perdues.\n\n" +
      "Trading Diary ne peut être tenu responsable de toute perte de données.",

    // ---------------- CONDITIONS ----------------
    termsTitle: "Conditions d’utilisation",
    termsBody:
      "Trading Diary est une application de journalisation et d’analyse personnelle destinée au suivi de vos activités de trading.\n\n" +
      "Les informations, statistiques et résultats affichés sont fournis à titre informatif uniquement et ne constituent en aucun cas un conseil financier, une recommandation d’investissement ou une incitation à trader.\n\n" +
      "Vous êtes seul responsable de vos décisions financières et de l’utilisation que vous faites de l’application.",

    // ---------------- DON / MONÉTISATION ----------------
    donationTitle: "Dons et soutien",
    donationBody:
      "L’application peut proposer un système de don volontaire afin de soutenir son développement.\n\n" +
      "Les dons sont entièrement facultatifs et ne débloquent aucune fonctionnalité supplémentaire ni avantage particulier.\n\n" +
      "Les paiements, lorsqu’ils sont disponibles, sont traités de manière sécurisée par Google Play Billing, conformément aux règles de Google Play.",

    // ---------------- RESPONSABILITÉ ----------------
    liabilityTitle: "Limitation de responsabilité",
    liabilityBody:
      'Trading Diary est fourni "en l’état", sans garantie de performance, d’exactitude ou d’adéquation à un usage particulier.\n\n' +
      "L’éditeur de l’application ne saurait être tenu responsable de pertes financières, directes ou indirectes, résultant de l’utilisation de l’application.",

    // ---------------- CONTACT ----------------
    contactTitle: "Contact et support",
    contactBody:
      "Pour toute question, assistance ou suggestion, vous pouvez nous contacter via le bouton Support disponible dans les paramètres de l’application.",
  },

  // ------------------ STATS -------------------------
  stats: {
    title: "Statistiques",
    equityTitle: "Courbe d’équité",
    noTrades: "Aucun trade enregistré.",
    notEnoughData: "Pas assez de données pour tracer la courbe.",
    minLabel: "Min",
    maxLabel: "Max",

    overviewTitle: "Vue d’ensemble",
    totalTrades: "Total trades",
    winners: "Gagnants",
    losers: "Perdants",
    breakeven: "Break-even",
    winrate: "Winrate (%)",

    pnlTitle: "Résultat",
    pnlTotal: "Résultat total",
    pnlAvgPerTrade: "Résultat moyen / trade",
    rrAvg: "RR moyen",

    bestWorstTitle: "Meilleur & pire trade",
    best: "Meilleur trade",
    worst: "Pire trade",
    noWinningTrade: "Aucun trade gagnant.",
    noLosingTrade: "Aucun trade perdant.",

    byInstrumentTitle: "Par actif",
    tradesLabel: "trades",
    seeAll: "Voir tout",
    seeLess: "Voir moins",
    noInstruments: "Aucun actif trouvé.",

    monthlyDetailTitle: "Détail mensuel",
    pnlThisMonth: "Résultat du mois",
    bestMonthsTitle: "Meilleurs mois",
    noPositiveMonth: "Aucun mois positif.",
  },

  // ------------------ TRADE FORM --------------------
  tradeForm: {
    dateLabel: "Date",
    newTradeTitle: "Nouveau trade",
    editTradeTitle: "Modifier le trade",
    instrumentLabel: "Actif",
    instrumentPlaceholder: "Ex : EUR/USD",
    directionLabel: "Direction",
    resultLabelPrefix: "Résultat",
    lotLabel: "Taille de lot",
    priceLabel: "Prix",
    entryPlaceholder: "Prix d'entrée",
    tpPlaceholder: "Take Profit",
    slPlaceholder: "Stop Loss",
    rrLabel: "RR",

    pnlExamplePlaceholder: "Ex : 25.50",
    lotExamplePlaceholder: "Ex : 0.25",
    rrExamplePlaceholder: "Ex : 2.35",

    emotionLabel: "Émotion",
    emotionCalm: "😌 Calme",
    emotionStress: "😰 Stress",
    emotionFomo: "🤯 FOMO",
    emotionRevenge: "😡 Enervé",
    emotionTired: "😴 Fatigué",
    emotionDisciplined: "✅ Discipliné",

    qualityLabel: "Qualité",
    respectPlanLabel: "Respect du plan",
    respectPlanYes: "Oui",
    respectPlanNo: "Non",

    commentLabel: "Commentaire",
    commentPlaceholder: "Ajoute des notes sur ton trade...",

    screenshotLabel: "Screenshot",
    screenshotGallery: "Gallerie",
    screenshotCamera: "Camera",
    screenshotRemove: "Supprimer",

    saveButton: "Enregistrer",
    updateButton: "Mettre à jour",

    missingRequiredFieldsTitle: "Champs requis manquants",
    missingRequiredFieldsMessage:
      "Veuillez remplir Actif et Résultat pour enregistrer le trade.",
    permissionNeededTitle: "Permission requise",
    galleryPermissionMessage: "L’accès à la galerie est nécessaire.",
    cameraPermissionMessage: "L’accès à la caméra est nécessaire.",
  },
};

// --------------------------------------------------
// ENGLISH
// --------------------------------------------------

const en = {
  // Monday → Sunday
  weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

  common: {
    cancel: "Cancel",
    ok: "OK",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
  },

  agenda: {
    title: "Agenda",
    noJournal: "No active journal",
    trades: "trades",
    today: "Today",
    monthNext: "Next month",
    monthPrev: "Previous month",

    profileLabel: "Journal",
    monthResultLabel: "Monthly result",
    winrateLabel: "Winrate",

    profilesTitle: "Profiles / journals",
    profileActiveBadge: "Active",
    renameActiveProfileLabel: "Rename active journal",
    saveProfileNameButton: "Save name",
    deleteActiveProfileButton: "Delete this journal",
    newProfileLabel: "New journal",
    newProfilePlaceholder: "New journal name",
    createAndActivateButton: "Create and activate",
    profilePlaceholder: "Select a journal",
    returnToCurrentMonth: "Back to current month",

    cannotDeleteLastProfileTitle: "Cannot delete",
    cannotDeleteLastProfileMessage:
      "You must have at least one active journal. Create a new one before deleting this one.",

    deleteProfileTitle: "Delete journal",
    deleteProfileMessage:
      'Do you really want to delete the journal "{{name}}"? This action cannot be undone.',
  },

  daySummary: {
    tradeDetailsTitle: "Trade",
    editTrade: "Edit trade",
    deleteTrade: "Delete trade",
    noTrades: 'No trades on this day. Tap "+" to add one.',
    totalPnl: "Total result",
    avgRr: "Avg RR",
    tradesCount: "Trades",
    actionQuestion: "What do you want to do with this trade?",
  },

  settings: {
    accountSectionTitle: "Account",
    preferencesSectionTitle: "Preferences",
    exportCsvSectionTitle: "Export CSV",
    exportJsonSectionTitle: "Export / Import JSON",
    resetSectionTitle: "Reset",
    versionSectionTitle: "Version",

    // ✅ NEW (V1)
    helpSectionTitle: "Help",
    legalPrivacyButton: "Terms & Privacy",
    supportButton: "Support",
    suggestionsButton: "Suggestions",
    helpEmailNote: "Contact: {{email}}",
    supportErrorTitle: "Unable to open email",
    supportErrorMessage: "No email app available on this device.",

    accountLocalInfo: "Local account",
    noEmailFallback: "No email provided",

    editAccountButton: "Edit account",
    saveAccountButton: "Save changes",
    usernameLabel: "Username",
    birthdateLabel: "Birthdate",
    emailLabel: "Email",
    usernamePlaceholder: "Your username",
    birthdatePlaceholder: "YYYY-MM-DD",
    emailPlaceholder: "your.email@example.com",

    accountInfosMissingTitle: "Missing information",
    accountInfosMissingMessage: "Please fill all required fields.",
    accountInvalidBirthdateTitle: "Invalid date",
    accountInvalidBirthdateMessage: "Please enter a valid date (YYYY-MM-DD).",
    accountUpdatedTitle: "Account updated",
    accountUpdatedMessage: "Your account information has been updated.",

    passwordNotDefinedTitle: "Password not defined",
    passwordNotDefinedMessage:
      "This local account has no password. Logout then login again to create one.",
    editPasswordButton: "Edit password",
    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password",
    confirmNewPasswordLabel: "Confirm password",
    currentPasswordPlaceholder: "Your current password",
    newPasswordPlaceholder: "New password",
    confirmPasswordPlaceholder: "Confirm password",
    passwordIncorrect: "Incorrect password",
    passwordUpdatedTitle: "Password updated",
    passwordUpdatedMessage: "Your password has been updated.",

    languageSectionTitle: "Language",
    currencySectionTitle: "Currency",
    themeSectionTitle: "Theme",
    themeDark: "Dark",
    themeLight: "Light",

    timeFormatSectionTitle: "Time format",
    format24h: "24h",
    format12h: "12h",

    logoutTitle: "Logout",
    logoutMessage: "Do you want to logout?",
    logoutButton: "Logout",
    logoutDoneTitle: "Logged out",
    logoutDoneMessage: "You have been logged out.",

    deleteAccountTitle: "Delete account",
    deleteAccountMessage: "Are you sure you want to delete this account?",
    deleteAccountConfirm: "Delete",
    deleteAccountButton: "Delete account",
    deleteAccountWarning:
      "Permanent action: all data related to this account will be deleted.",
    deleteAccountNoAccount: "No active account",

    deleteAccountModalTitle: "Password required",
    deleteAccountModalMessage:
      "Enter your password to confirm account deletion.",
    deleteAccountPasswordPlaceholder: "Password",
    deleteAccountPasswordErrorEmpty: "Please enter your password.",
    deleteAccountPasswordErrorWrong: "Incorrect password.",
    deleteAccountFinalTitle: "Deletion confirmed",
    deleteAccountFinalMessage: "The account will be deleted.",

    exportCsvDescription: "Export all your trades to a CSV file.",
    exportCsvHelper: "You can open it in Excel, Google Sheets, etc.",
    exportCsvButton: "Export CSV",
    exportCsvDoneTitle: "Export done",
    exportCsvDoneMessage: "CSV file generated.",
    exportCsvErrorTitle: "Export error",
    exportCsvErrorMessage: "Unable to generate CSV file.",

    exportJsonDescription: "Backup your account, journals and trades.",
    exportJsonHelper: "Useful to transfer your data to another device.",
    exportJsonButton: "Export JSON",
    importJsonButton: "Import JSON file",
    importJsonDoneTitle: "Import done",
    importJsonDoneMessage: "Your data has been restored.",
    importJsonErrorTitle: "Import error",
    importJsonErrorMessage: "Unable to import this file.",
    exportJsonInvalidFileTitle: "Invalid file",
    exportJsonInvalidFileMessage: "The file is not valid JSON.",
    importJsonInvalidFileTitle: "Invalid file",
    importJsonInvalidFileMessage: "The file is not valid JSON.",
    importJsonInvalidContentMessage:
      "The file content is not compatible with this app.",

    resetAppTitle: "Reset data",
    resetAppMessage: "All statistics and trades will be removed. Continue?",
    resetAppConfirm: "Reset",
    resetAppDoneTitle: "Reset done",
    resetAppDoneMessage: "Data has been deleted.",
    resetTradesButton: "Reset trades",
    resetTradesHelper:
      "Remove all trades and statistics but keep your account.",

    versionName: "Trading Diary — local version",
    versionDescription:
      "All data is stored locally on your device.\n\n" +
      "The Pro version will bring new features for subscribers and will arrive with V2.\n\n" +
      "In the meantime, you can support the project with donations.",

    donationButton: "Donate",
    donationAlertTitle: "Support the project",
    donationAlertMessage:
      "Thank you for your support 🙏\n\nDonations help fund development and future features.",
  },

  // ✅ LEGAL — TERMS / PRIVACY (V1 - Google Play ready)
  legal: {
    title: "Terms & Privacy",
    lastUpdated: "Last updated: 2026-01-14",

    // ---------------- PRIVACY ----------------
    privacyTitle: "Privacy policy",
    privacyBody:
      "Trading Diary respects your privacy. All data entered in the app (trades, statistics, settings) is stored exclusively on your device.\n\n" +
      "No personal data is collected, sent to a server, shared with third parties, or used for tracking, advertising, or analytics.\n\n" +
      "The app works fully offline and does not require any online account.",

    // ---------------- DATA & SECURITY ----------------
    dataSecurityTitle: "Data security",
    dataSecurityBody:
      "You are solely responsible for backing up and keeping your data safe. If you uninstall the app or lose your device, local data may be permanently lost.\n\n" +
      "Trading Diary cannot be held responsible for any data loss.",

    // ---------------- TERMS ----------------
    termsTitle: "Terms of use",
    termsBody:
      "Trading Diary is a personal journaling and analysis app designed to help you track your trading activity.\n\n" +
      "The information, statistics, and results shown are provided for informational purposes only and do not constitute financial advice, an investment recommendation, or an invitation to trade.\n\n" +
      "You are solely responsible for your financial decisions and for how you use the app.",

    // ---------------- DONATIONS ----------------
    donationTitle: "Donations & support",
    donationBody:
      "The app may offer an optional donation system to support its development.\n\n" +
      "Donations are entirely voluntary and do not unlock any additional features or benefits.\n\n" +
      "When available, payments are processed securely through Google Play Billing, in accordance with Google Play rules.",

    // ---------------- LIABILITY ----------------
    liabilityTitle: "Limitation of liability",
    liabilityBody:
      'Trading Diary is provided "as is", without any warranty of performance, accuracy, or fitness for a particular purpose.\n\n' +
      "The publisher of the app cannot be held liable for any direct or indirect financial losses resulting from the use of the app.",

    // ---------------- CONTACT ----------------
    contactTitle: "Contact & support",
    contactBody:
      "For any questions, assistance, or suggestions, you can contact us using the Support button available in the app settings.",
  },

  stats: {
    title: "Statistics",
    equityTitle: "Equity curve",
    noTrades: "No trades recorded.",
    notEnoughData: "Not enough data to draw the curve.",
    minLabel: "Min",
    maxLabel: "Max",

    overviewTitle: "Overview",
    totalTrades: "Total trades",
    winners: "Winners",
    losers: "Losers",
    breakeven: "Breakeven",
    winrate: "Winrate (%)",

    pnlTitle: "Result",
    pnlTotal: "Total Result",
    pnlAvgPerTrade: "Average Result per trade",
    rrAvg: "Avg RR",

    bestWorstTitle: "Best & Worst trades",
    best: "Best trade",
    worst: "Worst trade",
    noWinningTrade: "No winning trade.",
    noLosingTrade: "No losing trade.",

    byInstrumentTitle: "By asset",
    tradesLabel: "trades",
    seeAll: "See all",
    seeLess: "See less",
    noInstruments: "No Assets found.",

    monthlyDetailTitle: "Monthly detail",
    pnlThisMonth: "Month Result",
    bestMonthsTitle: "Best months",
    noPositiveMonth: "No positive month.",
  },

  tradeForm: {
    dateLabel: "Date",
    newTradeTitle: "New trade",
    editTradeTitle: "Edit trade",
    instrumentLabel: "Asset",
    instrumentPlaceholder: "Ex: EUR/USD",
    directionLabel: "Direction",
    resultLabelPrefix: "Result",
    lotLabel: "Lot size",
    priceLabel: "Price",
    entryPlaceholder: "Entry price",
    tpPlaceholder: "Take Profit",
    slPlaceholder: "Stop Loss",
    rrLabel: "RR",

    pnlExamplePlaceholder: "Ex: 25.50",
    lotExamplePlaceholder: "Ex: 0.25",
    rrExamplePlaceholder: "Ex: 2.35",

    emotionLabel: "Emotion",
    emotionCalm: "😌 Calm",
    emotionStress: "😰 Stress",
    emotionFomo: "🤯 FOMO",
    emotionRevenge: "😡 Revenge",
    emotionTired: "😴 Tired",
    emotionDisciplined: "✅ Disciplined",

    qualityLabel: "Quality",
    respectPlanLabel: "Plan respected",
    respectPlanYes: "Yes",
    respectPlanNo: "No",

    commentLabel: "Comment",
    commentPlaceholder: "Add some notes about this trade...",

    screenshotLabel: "Screenshot",
    screenshotGallery: "Gallery",
    screenshotCamera: "Camera",
    screenshotRemove: "Remove",

    saveButton: "Save",
    updateButton: "Update",

    missingRequiredFieldsTitle: "Missing required fields",
    missingRequiredFieldsMessage:
      "Please fill Asset and Result to save the trade.",
    permissionNeededTitle: "Permission needed",
    galleryPermissionMessage: "Gallery access is required.",
    cameraPermissionMessage: "Camera access is required.",
  },
};

// --------------------------------------------------
// HOOK useI18n
// --------------------------------------------------

type TParams = Record<string, string | number | boolean | null | undefined>;

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = params[key];
    if (value === null || value === undefined) return match;
    return String(value);
  });
}

export function useI18n() {
  const { language } = useLanguage();
  const dict = language === "en" ? en : fr;

  function t(key: string, params?: TParams): string {
    const parts = key.split(".");
    let current: any = dict;

    for (const p of parts) {
      if (current[p] === undefined) return key;
      current = current[p];
    }

    if (typeof current === "string") {
      return interpolate(current, params);
    }

    return key;
  }

  const weekdaysShort: string[] = dict.weekdaysShort ?? [
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
  ];

  return { t, language, weekdaysShort };
}
