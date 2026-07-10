import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon, PageShell } from "@/components/layout/page-shell";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/area-mentorados")({
  component: AreaMentoradosPage,
  beforeLoad: () => requireAuth(),
});


function AreaMentoradosPage() {
  return (
    <PageShell
      title="Área dos Mentorados"
      subtitle="Módulos, materiais extras e progresso da sua turma."
    >
      <ComingSoon
        title="Trilha de mentoria em construção"
        description="Os módulos serão organizados por turma. Em breve você acompanha seu progresso e acessa materiais exclusivos."
        bullets={[
          "Trilha da sua turma com módulos e aulas",
          "Materiais extras para download",
          "Progresso individual com badges",
          "Próximas lives e sessões de mentoria",
        ]}
      />
    </PageShell>
  );
}
