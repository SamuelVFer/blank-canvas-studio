import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarClock, ExternalLink, Info } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/agenda")({
  component: AdminAgendaPage,
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

function AdminAgendaPage() {
  return (
    <PageShell
      title="Agenda de Convites"
      subtitle="Dispare convites de mentoria para as turmas via WhatsApp."
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="direcionamento">Direcionamento Lovable</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Próximos disparos
                </CardTitle>
                <CardDescription>
                  Lista de convites agendados. Aqui você vê o que está em fila para envio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Em breve — conectado ao seu backend (n8n ou Supabase) mostrará a fila aqui.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Agendar novo convite</CardTitle>
                <CardDescription>
                  Formulário de agendamento virá aqui (turma, data, mensagem).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em construção. A direção técnica de como o Lovable deve montar isso está na aba ao
                  lado.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="direcionamento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Como o Lovable vai montar isso pra você
              </CardTitle>
              <CardDescription>
                Brief técnico que você pode colar no chat do Lovable (ou me pedir pra eu colar).
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm">
              <section>
                <h3 className="text-base font-semibold text-foreground">
                  1. Modelo de dados (Supabase)
                </h3>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{`table: invite_batches (
  id uuid pk,
  turma text not null,
  scheduled_for timestamptz not null,
  message_template text not null,
  status text default 'pending', -- pending | scheduled | sent | error
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

table: invite_recipients (
  id uuid pk,
  batch_id uuid references invite_batches(id) on delete cascade,
  mentorado_id uuid references auth.users,
  whatsapp text not null,
  sent_at timestamptz,
  delivery_status text  -- queued | delivered | read | failed
);`}</pre>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground">
                  2. UI — formulário (Lovable, Lovable Cloud, shadcn)
                </h3>
                <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                  <li>
                    <strong>Turma</strong>: select vindo de <code>turmas</code>.
                  </li>
                  <li>
                    <strong>Data/hora</strong>: <code>react-day-picker</code> + input time.
                  </li>
                  <li>
                    <strong>Mensagem</strong>: textarea com template (variáveis{" "}
                    <code>&#123;&#123;nome&#125;&#125;</code>,{" "}
                    <code>&#123;&#123;turma&#125;&#125;</code>, link de agenda).
                  </li>
                  <li>
                    <strong>Preview</strong>: card ao lado mostrando como vai chegar no WhatsApp.
                  </li>
                  <li>
                    <strong>Submit</strong>: cria linha em <code>invite_batches</code> com status{" "}
                    <code>pending</code>; UI mostra toast e a row na tabela.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground">
                  3. Disparo — webhook para n8n
                </h3>
                <p className="text-muted-foreground">
                  Em vez de chamar a API do WhatsApp direto do front (vaza token, bloqueia CORS),
                  cria um <strong>Edge Function</strong> no Lovable Cloud que recebe o{" "}
                  <code>batch_id</code>, monta a lista de recipients e faz <code>POST</code> para o
                  webhook do workflow
                  <code> tiktokPartnerInvite1</code> (já configurado) ou um workflow novo dedicado a{" "}
                  <em>convites de agenda</em>.
                </p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{`// supabase/functions/dispatch-invite/index.ts
serve(async (req) => {
  const { batch_id } = await req.json();
  // 1. busca batch + recipients
  // 2. POST https://n8n.amplify.com.br/webhook/dispatch-invite
  //    body: { batch_id, recipients: [{ whatsapp, vars }] }
  // 3. atualiza status para 'scheduled'
});`}</pre>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground">
                  4. O que NÃO precisa ser mudado
                </h3>
                <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                  <li>
                    O workflow <code>tiktokPartnerInvite1</code> já fala com a Huggy.
                  </li>
                  <li>As credenciais do n8n (Huggy Disparo, Supabase) já estão lá.</li>
                  <li>
                    A tabela <code>chat_messages</code> registra tudo — você já tem a query pra
                    auditar.
                  </li>
                </ul>
              </section>

              <a
                href="https://docs.lovable.dev/features/cloud"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Referência: Lovable Cloud · Edge Functions
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
