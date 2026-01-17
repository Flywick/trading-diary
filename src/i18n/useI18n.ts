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
    supportErrorMessage:
      "Aucune application mail disponible sur cet appareil.",

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
    birthdatePlaceholder: "1995-04-23",
    emailPlaceholder: "ton.email@example.com",

    accountInfosMissingTitle: "Informations manquantes",
    accountInfosMissingMessage: "Veuillez remplir tous les champs obligatoires.",
    accountInvalidBirthdateTitle: "Date invalide",
    accountInvalidBirthdateMessage:
      "Veuillez entrer une date au format YYYY-MM-DD.",
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
  "Merci pour votre soutien 🙏\n\nLes dons permettent de financer le développement et les futures fonctionnalités."

  },

  // ✅ NEW — LEGAL (CGU / PRIVACY)
  legal: {
    title: "CGU & Confidentialité",
    lastUpdated: "Dernière mise à jour : 14/01/2026",
    privacyTitle: "Confidentialité",
    privacyBody:
      "Cette application stocke vos données uniquement sur votre appareil. Aucune donnée n’est envoyée vers un serveur, aucun suivi (tracking) n’est effectué et aucune donnée n’est vendue.",
    termsTitle: "Conditions d’utilisation",
    termsBody:
      "Trading Diary fournit des outils de journalisation et de statistiques. Les informations affichées ne constituent pas des conseils financiers. Vous êtes seul responsable de vos décisions et de l’utilisation de l’application.",
    contactTitle: "Contact",
    contactBody:
      "Pour toute question, assistance ou suggestion, contactez-nous via le bouton Support dans les paramètres.",
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

    pnlTitle: "PnL",
    pnlTotal: "PnL total",
    pnlAvgPerTrade: "PnL moyen / trade",
    rrAvg: "RR moyen",

    bestWorstTitle: "Meilleur & pire trade",
    best: "Meilleur trade",
    worst: "Pire trade",
    noWinningTrade: "Aucun trade gagnant.",
    noLosingTrade: "Aucun trade perdant.",

    byInstrumentTitle: "Par instrument",
    tradesLabel: "trades",
    seeAll: "Voir tout",
    seeLess: "Voir moins",
    noInstruments: "Aucun instrument trouvé.",

    monthlyDetailTitle: "Détail mensuel",
    pnlThisMonth: "PnL du mois",
    bestMonthsTitle: "Meilleurs mois",
    noPositiveMonth: "Aucun mois positif.",
  },

  // ------------------ TRADE FORM --------------------
  tradeForm: {
    dateLabel: "Date",
    newTradeTitle: "Nouveau trade",
    editTradeTitle: "Modifier le trade",
    instrumentLabel: "Instrument",
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
    emotionCalm: "😌 calme",
    emotionStress: "😰 stress",
    emotionFomo: "🤯 FOMO",
    emotionRevenge: "😡 revenge",
    emotionTired: "😴 fatigué",
    emotionDisciplined: "✅ discipliné",

    qualityLabel: "Qualité",
    respectPlanLabel: "Respect du plan",
    respectPlanYes: "Oui",
    respectPlanNo: "Non",

    commentLabel: "Commentaire",
    commentPlaceholder: "Ajoute des notes sur ton trade...",

    screenshotLabel: "Screenshot",
    screenshotGallery: "Choisir",
    screenshotCamera: "Camera",
    screenshotRemove: "Supprimer",

    saveButton: "Enregistrer",
    updateButton: "Mettre à jour",

    missingRequiredFieldsTitle: "Champs requis manquants",
    missingRequiredFieldsMessage:
      "Veuillez remplir instrument et PnL pour enregistrer le trade.",
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
    birthdatePlaceholder: "1995-04-23",
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
  "Thank you for your support 🙏\n\nDonations help fund development and future features."

  },

  // ✅ NEW — LEGAL (TERMS / PRIVACY)
  legal: {
    title: "Terms & Privacy",
    lastUpdated: "Last updated: 2026-01-14",
    privacyTitle: "Privacy",
    privacyBody:
      "This app stores your data only on your device. No data is sent to any server, no tracking is performed, and no data is sold.",
    termsTitle: "Terms of use",
    termsBody:
      "Trading Diary provides journaling and statistics tools. The information shown is not financial advice. You are solely responsible for your decisions and for using the app.",
    contactTitle: "Contact",
    contactBody:
      "For questions, support or suggestions, contact us using the Support button in Settings.",
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

    pnlTitle: "PnL",
    pnlTotal: "Total PnL",
    pnlAvgPerTrade: "Average PnL per trade",
    rrAvg: "Avg RR",

    bestWorstTitle: "Best & Worst trades",
    best: "Best trade",
    worst: "Worst trade",
    noWinningTrade: "No winning trade.",
    noLosingTrade: "No losing trade.",

    byInstrumentTitle: "By instrument",
    tradesLabel: "trades",
    seeAll: "See all",
    seeLess: "See less",
    noInstruments: "No instruments found.",

    monthlyDetailTitle: "Monthly detail",
    pnlThisMonth: "Month PnL",
    bestMonthsTitle: "Best months",
    noPositiveMonth: "No positive month.",
  },

  tradeForm: {
    dateLabel: "Date",
    newTradeTitle: "New trade",
    editTradeTitle: "Edit trade",
    instrumentLabel: "Instrument",
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
    emotionCalm: "😌 calm",
    emotionStress: "😰 stress",
    emotionFomo: "🤯 FOMO",
    emotionRevenge: "😡 revenge",
    emotionTired: "😴 tired",
    emotionDisciplined: "✅ disciplined",

    qualityLabel: "Quality",
    respectPlanLabel: "Plan respected",
    respectPlanYes: "Yes",
    respectPlanNo: "No",

    commentLabel: "Comment",
    commentPlaceholder: "Add some notes about this trade...",

    screenshotLabel: "Screenshot",
    screenshotGallery: "Choose",
    screenshotCamera: "Camera",
    screenshotRemove: "Remove",

    saveButton: "Save",
    updateButton: "Update",

    missingRequiredFieldsTitle: "Missing required fields",
    missingRequiredFieldsMessage:
      "Please fill instrument and PnL to save the trade.",
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
