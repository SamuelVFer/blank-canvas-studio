import { createFileRoute, redirect } from "@tanstack/react-router";

import { ComingSoon, PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/duvidas-respostas")({
  component: DuvidasPage,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("tiktok-growth:auth:v1");
    if (!raw) throw redirect({ to: "/" });
  },
});

function DuvidasPage() {
  return (
    <PageShell
      title="Dúvidas e Respostas"
      subtitle="Tire suas dúvidas diretamente com o mentor Matheus Figueiredo."
    >
      <ComingSoon
        title="Fórum de Q&A em construção"
        description="Em breve: lista de perguntas da turma, formulário para enviar sua dúvida e respostas do mentor com notificação."
        bullets={[
          "Lista de perguntas com filtros por módulo e status",
          "Formulário para enviar nova dúvida com anexo",
          "Respostas do Matheus com marcação de 'resolvido'",
          "Notificação por e-mail quando sua dúvida for respondida",
        ]}
      />
    </PageShell>
  );
}