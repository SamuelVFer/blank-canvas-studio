import { redirect } from "@tanstack/react-router";

const LEGACY_KEY = "tiktok-growth:auth:v1";

/**
 * Verifica se há uma sessão ativa (Supabase real OU legado localStorage).
 * Usa apenas o storage; a verificação de role fina é feita no componente via useAuth.
 */
function readSession():
  | { role?: string; email?: string }
  | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Chave antiga (modo simulação)
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { role?: string; email?: string };
      if (parsed?.role) return parsed;
    }

    // 2. Sessão Supabase (sb-<project>-auth-token)
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const session = JSON.parse(raw) as {
        access_token?: string;
        user?: { email?: string; user_metadata?: { role?: string } };
      };
      if (!session?.access_token) continue;
      const email = session.user?.email;
      // Admin fixo por e-mail
      const role =
        email === "samuel@amplifyugc.co"
          ? "admin"
          : session.user?.user_metadata?.role || "mentorado";
      return { role, email };
    }
  } catch {
    // ignore
  }
  return null;
}

export function requireAuth(allowedRoles?: string[]) {
  if (typeof window === "undefined") return;
  const session = readSession();
  if (!session) throw redirect({ to: "/" });
  if (allowedRoles && session.role && !allowedRoles.includes(session.role)) {
    throw redirect({ to: "/" });
  }
}
