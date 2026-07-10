import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  GraduationCap,
  LogOut,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/lib/auth";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/meu-dash",
    label: "Meu Dash",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["marca", "admin"],
  },
  {
    to: "/area-mentorados",
    label: "Área dos Mentorados",
    icon: <GraduationCap className="h-4 w-4" />,
    roles: ["mentorado", "admin"],
  },
  {
    to: "/duvidas-respostas",
    label: "Dúvidas e Respostas",
    icon: <MessageCircle className="h-4 w-4" />,
    roles: ["mentorado", "admin"],
  },
  {
    to: "/admin",
    label: "Painel Admin",
    icon: <Sparkles className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    to: "/admin/turmas",
    label: "Admin · Turmas",
    icon: <Users className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    to: "/admin/agenda",
    label: "Admin · Agenda",
    icon: <Calendar className="h-4 w-4" />,
    roles: ["admin"],
  },
];

export interface PageShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Layout para rotas autenticadas. Header com wordmark + role-aware nav + logout,
 * sidebar colapsável em desktop, top-stack em mobile.
 */
export function PageShell({ children, title, subtitle }: PageShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null; // route guard handled by call-site

  const items = NAV_ITEMS.filter((it) => it.roles.includes(user.role));

  const handleLogout = async () => {
    logout();
    await router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0">
            <Wordmark size="md" />
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-semibold text-foreground">{user.name}</div>
              <div className="text-muted-foreground">
                <RoleBadge role={user.role} />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav scroll */}
        <div className="border-t border-border/40 md:hidden">
          <nav className="flex gap-1 overflow-x-auto px-4 py-2">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </header>
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        TikTok Growth · Mentorias Amplify
      </footer>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        role === "admin" && "bg-primary/10 text-primary",
        role === "marca" && "bg-[color:var(--brand-accent)]/10 text-[color:var(--brand-accent)]",
        role === "mentorado" && "bg-muted text-muted-foreground",
      )}
    >
      {role}
    </span>
  );
}

export interface ComingSoonProps {
  title?: string;
  description?: string;
  bullets?: string[];
}

export function ComingSoon({
  title = "Em breve",
  description = "Esta área está em construção. O conteúdo dinâmico será plugado em breve.",
  bullets,
}: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
