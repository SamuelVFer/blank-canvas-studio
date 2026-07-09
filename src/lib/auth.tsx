import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Auth mock — sem backend.
 *
 * Três perfis demo persistidos em localStorage. Quando o Samuel plugar
 * Supabase (Lovable Cloud), basta trocar este provider por um que
 * use a sessão real; o resto do app consome `useAuth()` e não muda.
 */

export type UserRole = "admin" | "marca" | "mentorado";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Marca-specific */
  brandId?: string;
  brandName?: string;
  /** Mentorado-specific */
  turma?: string;
  avatarUrl?: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "demo-admin",
    name: "Samuel V. Ferreira",
    email: "samuel@amplify.com.br",
    role: "admin",
  },
  marca: {
    id: "demo-marca",
    name: "Camila Souza",
    email: "camila@marca-x.com.br",
    role: "marca",
    brandId: "marca-x",
    brandName: "Marca X",
  },
  mentorado: {
    id: "demo-mentorado",
    name: "Lucas Pereira",
    email: "lucas@gmail.com",
    role: "mentorado",
    turma: "Turma 2026.1",
  },
};

export const DEMO_ROLES: UserRole[] = ["admin", "marca", "mentorado"];

const STORAGE_KEY = "tiktok-growth:auth:v1";

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed || typeof parsed !== "object" || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // QuotaExceeded etc — silently ignore for now.
  }
}

export function homeRouteFor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "marca":
      return "/meu-dash";
    case "mentorado":
      return "/area-mentorados";
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const loginAs = useCallback((role: UserRole) => {
    const next = DEMO_USERS[role];
    writeStoredUser(next);
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    writeStoredUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      loginAs,
      logout,
    }),
    [user, loading, loginAs, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}