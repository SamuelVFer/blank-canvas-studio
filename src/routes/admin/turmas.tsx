import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon, PageShell } from "@/components/layout/page-shell";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/turmas")({
  component: AdminTurmasPage,
  beforeLoad: () => requireAuth(["admin"]),
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
