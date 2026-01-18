import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const ACCOUNTS_STORAGE_KEY = "@trading-diary-accounts-v1";

export interface Account {
  id: string;
  username: string;
  birthdate: string; // "YYYY-MM-DD"
  email: string;
  password: string; // NOTE: stocké en clair pour l'instant (local only)
  createdAt: string; // ISO
}

interface AccountsState {
  accounts: Account[];
  activeAccountId?: string;
}

interface AccountContextValue {
  accounts: Account[];
  activeAccount: Account | null;
  isLoaded: boolean;
  register: (data: {
    username: string;
    birthdate: string;
    email: string;
    password: string;
  }) => void;
  login: (identifier: string, password: string) => void;
  logout: () => void;
  updateActiveAccount: (
    partial: Partial<Pick<Account, "username" | "birthdate" | "email">>,
  ) => void;
  deleteActiveAccount: () => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(
  undefined,
);

// 🧱 Petite “couche repo” locale pour les comptes
// → Demain, on remplacera ces deux fonctions par Supabase (Auth + profiles).

const loadAccountsState = async (): Promise<AccountsState> => {
  try {
    const stored = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!stored) {
      return { accounts: [], activeAccountId: undefined };
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return { accounts: [], activeAccountId: undefined };
    }
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      activeAccountId: parsed.activeAccountId,
    };
  } catch (e) {
    console.warn("Erreur chargement comptes (storage)", e);
    return { accounts: [], activeAccountId: undefined };
  }
};

const saveAccountsState = async (state: AccountsState): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Erreur sauvegarde comptes (storage)", e);
  }
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AccountsState>({
    accounts: [],
    activeAccountId: undefined,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔁 Chargement initial depuis le stockage local
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const loaded = await loadAccountsState();
        if (!cancelled) {
          setState({
            accounts: loaded.accounts ?? [],
            activeAccountId: loaded.activeAccountId,
          });
        }
      } catch (e) {
        console.warn("Erreur chargement comptes", e);
        if (!cancelled) {
          setState({ accounts: [], activeAccountId: undefined });
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
  }, []);

  // 🧠 Un seul endroit pour mettre à jour le state + sauvegarder
  const persist = async (next: AccountsState) => {
    setState(next);
    await saveAccountsState(next);
  };

  const activeAccount = state.activeAccountId
    ? (state.accounts.find((a) => a.id === state.activeAccountId) ?? null)
    : null;

  // 🆕 Création d’un compte local (V1 offline)
  const register: AccountContextValue["register"] = ({
    username,
    birthdate,
    email,
    password,
  }) => {
    const uname = username.trim();
    const mail = email.trim().toLowerCase();

    const exists = state.accounts.some(
      (a) =>
        a.username.toLowerCase() === uname.toLowerCase() ||
        a.email.toLowerCase() === mail,
    );
    if (exists) {
      throw new Error("Un compte avec ce pseudo ou cet email existe déjà.");
    }

    const now = new Date();
    const id = now.getTime().toString(36) + Math.random().toString(36).slice(2);

    const account: Account = {
      id,
      username: uname,
      birthdate: birthdate.trim(),
      email: mail,
      password, // NOTE: en prod côté serveur → hash (bcrypt / argon2)
      createdAt: now.toISOString(),
    };

    const next: AccountsState = {
      accounts: [...state.accounts, account],
      activeAccountId: account.id,
    };
    persist(next);
  };

  // 🔐 Login local : identifier = email OU pseudo
  const login: AccountContextValue["login"] = (identifier, password) => {
    const ident = identifier.trim().toLowerCase();

    const account = state.accounts.find((a) =>
      ident.includes("@")
        ? a.email.toLowerCase() === ident
        : a.username.toLowerCase() === ident,
    );

    if (!account || account.password !== password) {
      throw new Error("Identifiants incorrects.");
    }

    const next: AccountsState = {
      ...state,
      activeAccountId: account.id,
    };
    persist(next);
  };

  const logout = () => {
    const next: AccountsState = {
      ...state,
      activeAccountId: undefined,
    };
    persist(next);
  };

  const updateActiveAccount: AccountContextValue["updateActiveAccount"] = (
    partial,
  ) => {
    if (!activeAccount) return;

    const updated: Account = {
      ...activeAccount,
      ...partial,
      username:
        partial.username !== undefined
          ? partial.username.trim()
          : activeAccount.username,
      birthdate:
        partial.birthdate !== undefined
          ? partial.birthdate.trim()
          : activeAccount.birthdate,
      email:
        partial.email !== undefined
          ? partial.email.trim().toLowerCase()
          : activeAccount.email,
    };

    const accounts = state.accounts.map((a) =>
      a.id === updated.id ? updated : a,
    );
    const next: AccountsState = { ...state, accounts };
    persist(next);
  };

  const deleteActiveAccount = () => {
    if (!activeAccount) return;

    const accounts = state.accounts.filter((a) => a.id !== activeAccount.id);
    const next: AccountsState = {
      accounts,
      activeAccountId: undefined,
    };
    persist(next);
  };

  const value: AccountContextValue = {
    accounts: state.accounts,
    activeAccount,
    isLoaded,
    register,
    login,
    logout,
    updateActiveAccount,
    deleteActiveAccount,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return ctx;
};
