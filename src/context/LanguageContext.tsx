import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const LANGUAGE_STORAGE_KEY = "@trading-diary-language-v1";

export type Language = "fr" | "en";

interface LanguageState {
  language: Language;
  hasChosen: boolean;
}

interface LanguageContextValue {
  language: Language;
  hasChosenLanguage: boolean;
  isLoaded: boolean;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LanguageState>({
    language: "fr",
    hasChosen: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored) {
          const parsed: LanguageState = JSON.parse(stored);
          if (parsed.language === "fr" || parsed.language === "en") {
            setState({
              language: parsed.language,
              hasChosen: !!parsed.hasChosen,
            });
          }
        }
      } catch (e) {
        console.warn("Erreur chargement langue", e);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const persist = async (next: LanguageState) => {
    setState(next);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Erreur sauvegarde langue", e);
    }
  };

  const setLanguage = (lang: Language) => {
    const next: LanguageState = {
      language: lang,
      hasChosen: true,
    };
    persist(next);
  };

  const value: LanguageContextValue = {
    language: state.language,
    hasChosenLanguage: state.hasChosen,
    isLoaded,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
