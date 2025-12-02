import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAccount } from "./AccountContext";

const JOURNALS_KEY_PREFIX = "@trading-diary-journals-v1-";

// ⚙️ Pour l’instant tout le monde est "Free" → 1 profil max.
// Quand tu auras le rôle Pro depuis Supabase, tu pourras remplacer cette logique.
const IS_PRO = false;
const MAX_FREE_JOURNALS = 1;

export interface Journal {
  id: string;
  name: string;
  createdAt: string; // ISO
}

interface JournalsState {
  journals: Journal[];
  activeJournalId?: string;
}

interface JournalContextValue {
  journals: Journal[];
  activeJournal: Journal | null;
  isLoaded: boolean;
  createJournal: (name: string) => boolean; // ✅ true = créé, false = refus (limite)
  renameJournal: (id: string, newName: string) => void;
  setActiveJournal: (id: string) => void;
}

const JournalContext = createContext<JournalContextValue | undefined>(
  undefined
);

const makeStorageKey = (accountId: string) =>
  `${JOURNALS_KEY_PREFIX}${accountId}`;

const loadJournalsState = async (
  accountId: string
): Promise<JournalsState> => {
  const key = makeStorageKey(accountId);
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return { journals: [], activeJournalId: undefined };
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return { journals: [], activeJournalId: undefined };
    }
    return {
      journals: Array.isArray(parsed.journals) ? parsed.journals : [],
      activeJournalId: parsed.activeJournalId,
    };
  } catch (e) {
    console.warn("Erreur chargement journaux", e);
    return { journals: [], activeJournalId: undefined };
  }
};

const saveJournalsState = async (
  accountId: string,
  state: JournalsState
): Promise<void> => {
  const key = makeStorageKey(accountId);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn("Erreur sauvegarde journaux", e);
  }
};

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { activeAccount } = useAccount();
  const [state, setState] = useState<JournalsState>({
    journals: [],
    activeJournalId: undefined,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoaded(false);

      if (!activeAccount) {
        setState({ journals: [], activeJournalId: undefined });
        setIsLoaded(true);
        return;
      }

      try {
        const loaded = await loadJournalsState(activeAccount.id);
        let journals = loaded.journals ?? [];
        let activeJournalId = loaded.activeJournalId;

        // Si aucun journal → crée "Journal principal"
        if (journals.length === 0) {
          const now = new Date();
          const id =
            now.getTime().toString(36) + Math.random().toString(36).slice(2);
          const defaultJournal: Journal = {
            id,
            name: "Journal principal",
            createdAt: now.toISOString(),
          };
          journals = [defaultJournal];
          activeJournalId = id;

          if (!cancelled) {
            await saveJournalsState(activeAccount.id, {
              journals,
              activeJournalId,
            });
          }
        }

        if (!cancelled) {
          setState({ journals, activeJournalId });
        }
      } catch (e) {
        console.warn("Erreur chargement journaux", e);
        if (!cancelled) {
          setState({ journals: [], activeJournalId: undefined });
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeAccount?.id]);

  const persist = async (next: JournalsState) => {
    setState(next);
    if (!activeAccount) return;
    await saveJournalsState(activeAccount.id, next);
  };

  const activeJournal =
    state.activeJournalId && state.journals.length > 0
      ? state.journals.find((j) => j.id === state.activeJournalId) ??
        state.journals[0]
      : state.journals[0] ?? null;

  const createJournal: JournalContextValue["createJournal"] = (name) => {
    if (!activeAccount) return false;

    // 🔒 Limite Free
    if (!IS_PRO && state.journals.length >= MAX_FREE_JOURNALS) {
      return false;
    }

    const trimmed = name.trim();
    const finalName = trimmed.length > 0 ? trimmed : "Nouveau journal";

    const now = new Date();
    const id =
      now.getTime().toString(36) + Math.random().toString(36).slice(2);

    const newJournal: Journal = {
      id,
      name: finalName,
      createdAt: now.toISOString(),
    };

    const next: JournalsState = {
      journals: [...state.journals, newJournal],
      activeJournalId: newJournal.id,
    };

    persist(next);
    return true;
  };

  const renameJournal: JournalContextValue["renameJournal"] = (
    id,
    newName
  ) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const journals = state.journals.map((j) =>
      j.id === id
        ? {
            ...j,
            name: trimmed,
          }
        : j
    );

    const next: JournalsState = {
      ...state,
      journals,
    };

    persist(next);
  };

  const setActiveJournal: JournalContextValue["setActiveJournal"] = (id) => {
    const exists = state.journals.some((j) => j.id === id);
    if (!exists) return;

    const next: JournalsState = {
      ...state,
      activeJournalId: id,
    };
    persist(next);
  };

  const value: JournalContextValue = {
    journals: state.journals,
    activeJournal,
    isLoaded,
    createJournal,
    renameJournal,
    setActiveJournal,
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const ctx = useContext(JournalContext);
  if (!ctx) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return ctx;
};
