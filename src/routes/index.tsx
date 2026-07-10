import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BarChart3, Lock, Mail, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";
import { DEMO_USERS, homeRouteFor, useAuth, type UserRole } from "@/lib/auth";
import { hasSupabaseConfigured } from "@/lib/supabase";

// No head() here: home inherits meta from __root.tsx.

export const Route = createFileRoute("/")({
  component: LoginPage,
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

interface DemoProfile {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Acesso total: turmas, Q&A, agenda",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    role: "marca",
    label: "Marca",
    description: "Stats isoladas por marca",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    role: "mentorado",
    label: "Mentorado",
    description: "Conteúdos + dúvidas com o mentor",
    icon: <MessageCircle className="h-4 w-4" />,
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login, loginAs, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, bounce to the role-specific home.
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: homeRouteFor(user.role) });
    }
  }, [loading, user, navigate]);

  const handleDemoLogin = (role: UserRole) => {
    setSubmitting(true);
    setError(null);
    loginAs(role);
    // Tiny delay so the user sees the transition animation.
    setTimeout(() => {
      navigate({ to: homeRouteFor(role) });
    }, 180);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      // O useEffect redirecionará automaticamente
    } else {
      setError(res.error || "Credenciais inválidas");
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setError(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-gradient">
      {/* Floating orbs in background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-[color:var(--brand-accent)]/30 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemVariants} className="mb-6 flex flex-col items-center">
          <Wordmark size="xl" withBadge />
          <p className="mt-4 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
            Sua plataforma de mentorias TikTok Growth. Acompanhe seu progresso, tire dúvidas com o
            mentor e acesse conteúdos exclusivos.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-md">
          <Card className="border-border/60 bg-card/85 shadow-2xl backdrop-blur-md">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => setError("Recuperação de senha virá com o Supabase.")}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Entrando..." : "Entrar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {!hasSupabaseConfigured && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-card px-2 text-muted-foreground">
                        ou entre rápido como
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {DEMO_PROFILES.map((profile) => (
                      <DemoLoginButton
                        key={profile.role}
                        profile={profile}
                        onClick={() => handleDemoLogin(profile.role)}
                        disabled={submitting}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.footer
          variants={itemVariants}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="underline-offset-2 hover:underline">
            Termos
          </a>{" "}
          e{" "}
          <a href="#" className="underline-offset-2 hover:underline">
            Política de Privacidade
          </a>
          .
        </motion.footer>

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur"
          >
            <span>
              Já logado como <strong className="text-foreground">{user.name}</strong> ({user.role})
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="font-medium text-primary hover:underline"
            >
              sair
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}

function DemoLoginButton({
  profile,
  onClick,
  disabled,
}: {
  profile: DemoProfile;
  onClick: () => void;
  disabled: boolean;
}) {
  const user = DEMO_USERS[profile.role];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {profile.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{profile.label}</div>
        <div className="truncate text-xs text-muted-foreground">
          {user.name} · {profile.description}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </motion.button>
  );
}
