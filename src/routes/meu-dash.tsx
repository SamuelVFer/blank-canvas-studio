import { createFileRoute, redirect } from "@tanstack/react-router";

import { ComingSoon, PageShell } from "@/components/layout/page-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/meu-dash")({
  component: MeuDashPage,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("tiktok-growth:auth:v1");
    if (!raw) throw redirect({ to: "/" });
  },
});

function MeuDashPage() {
  const { user } = useAuth();
  const brandName = user?.brandName ?? "sua marca";

  return (
    <PageShell
      title={`Olá, ${brandName} 👋`}
      subtitle="Aqui você acompanha GMV, lives, vídeos e visualizações da sua marca."
    >
      <ComingSoon
        title="Dashboard em construção"
        description="Os números reais (GMV por vídeo, lives, visualizações) serão plugados assim que a integração com a fonte de dados ficar pronta."
        bullets={[
          "Cards de KPI: GMV total, ticket médio, conversão",
          "Gráfico de GMV por dia/semana/mês",
          "Performance por live e por vídeo",
          "Comparativo com período anterior",
        ]}
      />
    </PageShell>
  );
}
