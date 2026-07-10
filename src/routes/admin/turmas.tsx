import { createFileRoute, redirect } from "@tanstack/react-router";

import { ComingSoon, PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/admin/turmas")({
  component: AdminTurmasPage,
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

function AdminTurmasPage() {
  return (
    <PageShell
      title="Gerenciamento de Turmas"
      subtitle="CRUD de turmas, vínculo de mentorados e materiais."
    >
      <ComingSoon
        title="Módulo de turmas em construção"
        description="Lista, criação e edição de turmas. Vincule mentorados, defina trilhas e controle acesso."
        bullets={[
          "Tabela de turmas com busca e filtros",
          "Formulário de criação/edição (nome, mentor, datas)",
          "Vincular/desvincular mentorados em massa",
          "Histórico de mudanças por turma",
        ]}
      />
    </PageShell>
  );
}
