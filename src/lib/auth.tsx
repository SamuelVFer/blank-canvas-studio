import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, hasSupabaseConfigured } from "./supabase";

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
    name: "Samuel V. Fernandes",
    email: "samuel@amplifyugc.co",
    role: "admin",
  },
  marca: {
    id: "demo-marca",
    name: "Representante da Marca",
    email: "marca@amplifyugc.co",
    role: "marca",
    brandId: "marca-parceira",
    brandName: "Marca Parceira",
  },
  mentorado: {
    id: "demo-mentorado",
    name: "Mentorado Tiktok",
    email: "aluno@amplifyugc.co",
    role: "mentorado",
    turma: "Turma 2026.1",
  },
};

const STORAGE_KEY = "tiktok-growth:auth:v1";

function getHelperNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "Usuário";
  // Subsititui pontos ou traços por espaços e capitaliza
  return localPart
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
    // Silently ignore storage quota errors
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
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitora alterações de autenticação (Supabase ou LocalStorage)
  useEffect(() => {
    if (hasSupabaseConfigured) {
      // Carrega sessão atual do Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || "";
          let role: UserRole = "mentorado";

          if (email === "samuel@amplifyugc.co") {
            role = "admin";
          } else if (session.user.user_metadata?.role) {
            role = session.user.user_metadata.role;
          }

          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || getHelperNameFromEmail(email),
            email: email,
            role: role,
            brandId: session.user.user_metadata?.brandId,
            brandName: session.user.user_metadata?.brandName,
            turma: session.user.user_metadata?.turma || "Turma Geral",
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      // Escuta mudanças de auth
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          let role: UserRole = "mentorado";

          if (email === "samuel@amplifyugc.co") {
            role = "admin";
          } else if (session.user.user_metadata?.role) {
            role = session.user.user_metadata.role;
          }

          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || getHelperNameFromEmail(email),
            email: email,
            role: role,
            brandId: session.user.user_metadata?.brandId,
            brandName: session.user.user_metadata?.brandName,
            turma: session.user.user_metadata?.turma || "Turma Geral",
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Fallback: LocalStorage
      setUser(readStoredUser());
      setLoading(false);
    }
  }, []);

  // Login genérico (suporta real & mock)
  const login = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      const emailLower = email.toLowerCase().trim();

      if (hasSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailLower,
            password: password || "",
          });

          if (error) {
            setLoading(false);
            return { success: false, error: error.message };
          }

          if (data.user) {
            const userEmail = data.user.email || "";
            let role: UserRole = "mentorado";

            if (userEmail === "samuel@amplifyugc.co") {
              role = "admin";
            } else if (data.user.user_metadata?.role) {
              role = data.user.user_metadata.role;
            }

            const activeUser: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name || getHelperNameFromEmail(userEmail),
              email: userEmail,
              role: role,
              brandId: data.user.user_metadata?.brandId,
              brandName: data.user.user_metadata?.brandName,
              turma: data.user.user_metadata?.turma || "Turma Geral",
            };
            setUser(activeUser);
            setLoading(false);
            return { success: true };
          }
        } catch (e) {
          setLoading(false);
          const message = e instanceof Error ? e.message : "Erro de conexão";
          return { success: false, error: message };
        }
      }

      // MODO FALLBACK (Sem Supabase chaves ativas)
      // Validação das credenciais ADM
      if (emailLower === "samuel@amplifyugc.co") {
        if (password === "Amplify@1980") {
          const adminUser: User = {
            id: "demo-admin",
            name: "Matheus Figueiredo",
            email: "samuel@amplifyugc.co",
            role: "admin",
          };
          writeStoredUser(adminUser);
          setUser(adminUser);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, error: "Senha de administrador incorreta" };
        }
      }

      // Para mentorados e outras marcas de testes na simulação:
      let role: UserRole = "mentorado";
      if (emailLower.includes("marca")) {
        role = "marca";
      }

      const mockUser: User = {
        id: `mock-${role}-${Date.now()}`,
        name: getHelperNameFromEmail(emailLower),
        email: emailLower,
        role: role,
        brandId: role === "marca" ? "marca-custom" : undefined,
        brandName: role === "marca" ? "Marca Simulação" : undefined,
        turma: role === "mentorado" ? "Turma Geral" : undefined,
      };

      writeStoredUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return { success: true };
    },
    [],
  );

  // Facilidade para login rápido por botão demonstrativo
  const loginAs = useCallback((role: UserRole) => {
    if (hasSupabaseConfigured) {
      console.warn("loginAs ignorado pois o Supabase está ativado no .env");
      return;
    }
    const next = DEMO_USERS[role];
    writeStoredUser(next);
    setUser(next);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    if (hasSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    writeStoredUser(null);
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      loginAs,
      logout,
    }),
    [user, loading, login, loginAs, logout],
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
