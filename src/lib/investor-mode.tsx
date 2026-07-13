import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type InvestorModeContextValue = {
  investorMode: boolean;
  setInvestorMode: (v: boolean) => void;
  toggle: () => void;
  hydrated: boolean;
};

const InvestorModeContext = createContext<InvestorModeContextValue | null>(null);

const STORAGE_KEY = "portfolio-investor-mode";

export function InvestorModeProvider({ children }: { children: ReactNode }) {
  const [investorMode, setInvestorModeState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted value after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    try {
      setInvestorModeState(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setInvestorMode = useCallback((v: boolean) => {
    setInvestorModeState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => setInvestorMode(!investorMode), [investorMode, setInvestorMode]);

  const value = useMemo(
    () => ({ investorMode, setInvestorMode, toggle, hydrated }),
    [investorMode, setInvestorMode, toggle, hydrated],
  );

  return <InvestorModeContext.Provider value={value}>{children}</InvestorModeContext.Provider>;
}

export function useInvestorMode(): InvestorModeContextValue {
  const ctx = useContext(InvestorModeContext);
  if (!ctx) {
    // Safe fallback so the hook never throws outside the provider.
    return { investorMode: false, setInvestorMode: () => {}, toggle: () => {}, hydrated: false };
  }
  return ctx;
}
