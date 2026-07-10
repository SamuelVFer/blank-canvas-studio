import { createFileRoute, redirect } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminLandingPage,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("tiktok-growth:auth:v1");
    if (!raw) throw redirect({ to: "/" });
    try {
      const u = JSON.parse(raw) as { role?: string };
      if (u.role !== "admin") throw redirect({ to: "/" });
    } catch {
      throw redirect({ to: "/" });
    }
  },
});

function AdminLandingPage() {
  const { user } = useAuth();

  return (
    <PageShell
      title="Painel Administrativo"
      subtitle={`Bem-vindo, ${user?.name ?? "admin"}. Aqui você controla tudo.`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Turmas</CardTitle>
            <CardDescription>Crie, edite e gerencie turmas de mentorados.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/turmas" className="text-sm font-medium text-primary hover:underline">
              Abrir gerenciamento →
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agenda de convites</CardTitle>
            <CardDescription>Dispare convites de agenda para as turmas.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/agenda" className="text-sm font-medium text-primary hover:underline">
              Configurar disparo →
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dúvidas e Respostas</CardTitle>
            <CardDescription>Veja e responda perguntas dos mentorados.</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/duvidas-respostas"
              className="text-sm font-medium text-primary hover:underline"
            >
              Abrir Q&A →
            </a>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
