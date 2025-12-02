// src/context/TradesContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "./AccountContext";
import { useJournal } from "./JournalContext";

export type Direction = "BUY" | "SELL";

export type Emotion =
  | "calm"
  | "stress"
  | "fomo"
  | "revenge"
  | "tired"
  | "disciplined";

export type Quality = "A" | "B" | "C";

export interface Trade {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  instrument: string;
  direction: Direction;
  pnl: number; // résultat (PnL) dans la devise de l'utilisateur
  rr?: number;
  lotSize?: number;
  entryPrice?: number;
  tpPrice?: number;
  slPrice?: number;
  emotion?: Emotion;
  quality?: Quality;
  respectPlan?: boolean;
  comment?: string;
  screenshotUri?: string;

  // Nouveau : journal auquel appartient le trade
  journalId?: string;
}

interface TradesContextValue {
  trades: Trade[]; // uniquement ceux du journal actif
  addTrade: (trade: Omit<Trade, "id" | "journalId">) => void;
  updateTrade: (
    id: string,
    updates: Partial<Omit<Trade, "id" | "journalId">>
  ) => void;
  deleteTrade: (id: string) => void;
  resetTrades: () => void; // pour le compte et tous ses journaux
}

const TradesContext = createContext<TradesContextValue | undefined>(undefined);

// ⚙️ Clé de stockage locale (v1 = version local)
const TRADES_KEY_PREFIX = "@trading-diary-trades-v1-";

// 🧱 Petite couche "repo" locale
const makeStorageKey = (accountId: string) =>
  `${TRADES_KEY_PREFIX}${accountId}`;

const loadTradesForAccount = async (
  accountId: string
): Promise<Trade[]> => {
  const storageKey = makeStorageKey(accountId);
  const stored = await AsyncStorage.getItem(storageKey);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as Trade[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn("Erreur parse trades depuis le stockage", e);
    return [];
  }
};

const saveTradesForAccount = async (
  accountId: string,
  trades: Trade[]
): Promise<void> => {
  const storageKey = makeStorageKey(accountId);
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(trades));
  } catch (e) {
    console.warn("Erreur sauvegarde trades", e);
  }
};

export const TradesProvider = ({ children }: { children: ReactNode }) => {
  const { activeAccount } = useAccount();
  const { activeJournal } = useJournal();

  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]); // filtrés par journal

  // Utilitaire pour filtrer les trades par journal actif
  const filterByJournal = (
    source: Trade[],
    journalId?: string
  ): Trade[] => {
    if (!journalId) return source;
    return source.filter((t) => t.journalId === journalId);
  };

  // 🔁 Charger les trades du compte actif + migration journalId
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!activeAccount) {
        setAllTrades([]);
        setTrades([]);
        return;
      }

      try {
        const loaded = await loadTradesForAccount(activeAccount.id);
        let upgraded = false;
        let upgradedTrades = loaded;

        // Migration : si certains trades n'ont pas de journalId, on les
        // rattache au journal actif (journal principal) et on sauvegarde.
        if (activeJournal) {
          upgradedTrades = loaded.map((t) => {
            if (!t.journalId) {
              upgraded = true;
              return { ...t, journalId: activeJournal.id };
            }
            return t;
          });

          if (upgraded) {
            await saveTradesForAccount(activeAccount.id, upgradedTrades);
          }
        }

        if (!cancelled) {
          setAllTrades(upgradedTrades);
          const filtered = filterByJournal(
            upgradedTrades,
            activeJournal?.id
          );
          setTrades(filtered);
        }
      } catch (e) {
        console.warn("Erreur chargement trades", e);
        if (!cancelled) {
          setAllTrades([]);
          setTrades([]);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeAccount?.id, activeJournal?.id]);

  // Quand le journal actif change, on recalcule juste le filtre
  useEffect(() => {
    if (!activeJournal) {
      setTrades(allTrades);
      return;
    }
    const filtered = filterByJournal(allTrades, activeJournal.id);
    setTrades(filtered);
  }, [activeJournal?.id, allTrades]);

  // 🧠 Mise à jour + sauvegarde pour le compte courant
  const persistForCurrentAccount = async (nextAllTrades: Trade[]) => {
    setAllTrades(nextAllTrades);
    const filtered = filterByJournal(nextAllTrades, activeJournal?.id);
    setTrades(filtered);

    if (!activeAccount) return;
    await saveTradesForAccount(activeAccount.id, nextAllTrades);
  };

  const addTrade: TradesContextValue["addTrade"] = (tradeWithoutId) => {
    if (!activeAccount) {
      console.warn(
        "Impossible d'ajouter un trade : aucun compte actif."
      );
      return;
    }
    if (!activeJournal) {
      console.warn(
        "Impossible d'ajouter un trade : aucun journal actif."
      );
      return;
    }

    const now = new Date();
    const id =
      now.getTime().toString(36) + Math.random().toString(36).slice(2);

    const newTrade: Trade = {
      id,
      ...tradeWithoutId,
      journalId: activeJournal.id,
    };

    const next = [...allTrades, newTrade];
    persistForCurrentAccount(next);
  };

  const updateTrade: TradesContextValue["updateTrade"] = (
    id,
    updates
  ) => {
    const next = allTrades.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
          }
        : t
    );
    persistForCurrentAccount(next);
  };

  const deleteTrade: TradesContextValue["deleteTrade"] = (id) => {
    const next = allTrades.filter((t) => t.id !== id);
    persistForCurrentAccount(next);
  };

  const resetTrades = () => {
    persistForCurrentAccount([]);
  };

  const value: TradesContextValue = {
    trades,
    addTrade,
    updateTrade,
    deleteTrade,
    resetTrades,
  };

  return (
    <TradesContext.Provider value={value}>{children}</TradesContext.Provider>
  );
};

export const useTrades = () => {
  const ctx = useContext(TradesContext);
  if (!ctx) {
    throw new Error("useTrades must be used within a TradesProvider");
  }
  return ctx;
};
