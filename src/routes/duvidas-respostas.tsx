import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Filter,
  Check,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { supabase, hasSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/duvidas-respostas")({
  component: DuvidasPage,
  beforeLoad: () => requireAuth(),
});


interface Duvida {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string;
  category: string;
  is_public: boolean;
  status: "pending" | "answered" | "resolved";
  answer_text?: string;
  answered_by?: string;
  answered_at?: string;
  created_at: string;
}

const CATEGORIES = [
  "Módulo 1 - Nicho e Posicionamento",
  "Módulo 2 - Roteirização Viral",
  "Módulo 3 - Edição Dinâmica & Retenção",
  "Módulo 4 - Algoritmo & Métricas TikTok",
  "Módulo 5 - Monetização & Parcerias com Marcas",
  "Outros Assuntos",
];

const LOCAL_STORAGE_KEY = "tiktok-growth:duvidas:v1";

function DuvidasPage() {
  const { user } = useAuth();
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "pending">("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Admin reply states
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  // Force Tab check based on role to avoid invalid view configurations
  useEffect(() => {
    if (user?.role === "admin") {
      setActiveTab("pending");
    } else {
      setActiveTab("all");
    }
  }, [user]);

  const loadLocalQuestions = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        setDuvidas(JSON.parse(raw));
      } else {
        setDuvidas([]);
      }
    } catch {
      setError("Falha ao ler cache local de dúvidas.");
    }
  }, []);

  const saveLocalQuestions = useCallback((updated: Duvida[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setDuvidas(updated);
  }, []);

  // Load questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (hasSupabaseConfigured) {
      try {
        const { data, error: err } = await supabase
          .from("duvidas")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setDuvidas((data || []) as Duvida[]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar dúvidas do Supabase.";
        setError(message);
        // Fallback local caso dê erro no Supabase
        loadLocalQuestions();
      }
    } else {
      loadLocalQuestions();
    }
    setLoading(false);
  }, [loadLocalQuestions]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Submit new question
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setSending(true);
    setError(null);

    const newQuestionData = {
      title: title.trim(),
      description: description.trim(),
      category,
      is_public: isPublic,
      status: "pending" as const,
    };

    if (hasSupabaseConfigured) {
      try {
        const { error: err } = await supabase.from("duvidas").insert({
          ...newQuestionData,
          user_id: user.id,
          user_name: user.name,
        });

        if (err) throw err;
        await loadQuestions();
        resetForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao publicar dúvida no Supabase.";
        setError(message);
        setSending(false);
      }
    } else {
      // Local implementation
      const newDuvida: Duvida = {
        id: `local-duvida-${Date.now()}`,
        user_id: user.id,
        user_name: user.name,
        ...newQuestionData,
        created_at: new Date().toISOString(),
      };

      const updated = [newDuvida, ...duvidas];
      saveLocalQuestions(updated);
      resetForm();
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setIsPublic(true);
    setShowNewForm(false);
  };

  // Submit Answer (Admin only)
  const handleAnswerSubmit = async (duvidaId: string) => {
    const text = replyText[duvidaId];
    if (!text?.trim() || !user) return;

    setReplyingId(duvidaId);
    setError(null);

    if (hasSupabaseConfigured) {
      try {
        const { error: err } = await supabase
          .from("duvidas")
          .update({
            answer_text: text.trim(),
            answered_by: user.id,
            answered_at: new Date().toISOString(),
            status: "answered",
          })
          .eq("id", duvidaId);

        if (err) throw err;
        await loadQuestions();
        setReplyText((prev) => ({ ...prev, [duvidaId]: "" }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar resposta.";
        setError(message);
      }
    } else {
      const updated = duvidas.map((d) => {
        if (d.id === duvidaId) {
          return {
            ...d,
            answer_text: text.trim(),
            answered_by: user.id,
            answered_at: new Date().toISOString(),
            status: "answered" as const,
          };
        }
        return d;
      });
      saveLocalQuestions(updated);
      setReplyText((prev) => ({ ...prev, [duvidaId]: "" }));
    }
    setReplyingId(null);
  };

  // Mark question as Resolved (Student who created it or Admin)
  const handleMarkResolved = async (duvidaId: string) => {
    setError(null);
    if (hasSupabaseConfigured) {
      try {
        const { error: err } = await supabase
          .from("duvidas")
          .update({ status: "resolved" })
          .eq("id", duvidaId);

        if (err) throw err;
        await loadQuestions();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao alterar status da dúvida.";
        setError(message);
      }
    } else {
      const updated = duvidas.map((d) => {
        if (d.id === duvidaId) {
          return { ...d, status: "resolved" as const };
        }
        return d;
      });
      saveLocalQuestions(updated);
    }
  };

  // Filter logic
  const filteredDuvidas = duvidas.filter((d) => {
    // 1. Tab filter
    if (user?.role === "admin") {
      if (activeTab === "pending" && d.status !== "pending") return false;
    } else {
      if (activeTab === "mine" && d.user_id !== user?.id) return false;
      if (activeTab === "all" && !d.is_public && d.user_id !== user?.id) return false;
    }

    // 2. Category filter
    if (selectedCategory !== "all" && d.category !== selectedCategory) return false;

    // 3. Search filter
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchUser = d.user_name.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchUser;
    }

    return true;
  });

  return (
    <PageShell
      title="Dúvidas e Respostas"
      subtitle="Fórum integrado para resolver questões sobre as mentorias TikTok Growth."
    >
      <div className="space-y-6">
        {/* Supabase status banner */}
        {!hasSupabaseConfigured && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div>
              <strong>Modo de Simulação Ativo:</strong> As dúvidas estão sendo salvas no cache do
              seu navegador (`localStorage`). Para integrar o Supabase real, configure as variáveis
              no arquivo `.env` e aplique o script `schema.sql` no console do seu banco de dados.
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-auto p-1">
              Fechar
            </Button>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex border-b border-border/60">
            {user?.role !== "admin" ? (
              <>
                <button
                  id="tab-all-questions"
                  onClick={() => setActiveTab("all")}
                  className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "all"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Perguntas Coletivas (Públicas)
                </button>
                <button
                  id="tab-my-questions"
                  onClick={() => setActiveTab("mine")}
                  className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "mine"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Minhas Dúvidas
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-pending-questions"
                  onClick={() => setActiveTab("pending")}
                  className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "pending"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pendentes para Resposta
                </button>
                <button
                  id="tab-all-admin-questions"
                  onClick={() => setActiveTab("all")}
                  className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "all"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Histórico de Dúvidas
                </button>
              </>
            )}
          </div>

          {/* New Question Toggle (Student only) */}
          {user?.role !== "admin" && (
            <Button
              id="btn-toggle-new-question"
              onClick={() => setShowNewForm(!showNewForm)}
              className="sm:w-auto"
            >
              {showNewForm ? "Cancelar envio" : "Fazer Pergunta"}
              <Plus
                className={`ml-2 h-4 w-4 transition-transform ${showNewForm ? "rotate-45" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* New Question Form */}
        <AnimatePresence>
          {showNewForm && user?.role !== "admin" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                      Nova Pergunta ao Mentor
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="q-title">Título da Dúvida</Label>
                        <Input
                          id="q-title"
                          placeholder="Ex: Como otimizar ganchos nos primeiros 3 segundos?"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="q-category">Relacionado a qual conteúdo?</Label>
                        <select
                          id="q-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="q-desc">Explique sua Dúvida com detalhes</Label>
                      <Textarea
                        id="q-desc"
                        placeholder="Descreva o problema, o que você já tentou e qual canal/vídeo está analisando."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-32"
                        required
                      />
                    </div>

                    {/* Visibility Option */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-3">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="q-public"
                          className="text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          {isPublic ? (
                            <Unlock className="h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-amber-500" />
                          )}
                          Compartilhar com a Comunidade
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Se ativado, outros alunos da mentoria poderão visualizar sua dúvida e a
                          resposta.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="q-public"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={resetForm} disabled={sending}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={sending}>
                        {sending ? "Publicando..." : "Enviar Dúvida"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por módulo, título ou autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Todos os Conteúdos</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm">Buscando fórum de dúvidas...</p>
          </div>
        ) : filteredDuvidas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Nenhuma dúvida encontrada
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tente reajustar seus filtros de busca ou publique sua primeira dúvida acima.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDuvidas.map((duvida) => (
              <Card
                key={duvida.id}
                className="overflow-hidden border-border/80 transition-shadow hover:shadow-md"
              >
                <div className="border-b border-border/40 bg-muted/10 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">{duvida.user_name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {duvida.category}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(duvida.created_at).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Public/Private Badge */}
                    {duvida.is_public ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                        <Unlock className="h-3 w-3" />
                        Pública
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                        <Lock className="h-3 w-3" />
                        Individual
                      </span>
                    )}

                    {/* Status Badge */}
                    <StatusBadge status={duvida.status} />
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Title and Question */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-foreground">{duvida.title}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {duvida.description}
                    </p>
                  </div>

                  {/* Mentor Response Section */}
                  {duvida.answer_text ? (
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Resposta Oficial do Mentor Matheus Figueiredo</span>
                        </div>
                        {duvida.answered_at && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(duvida.answered_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap pl-6">
                        {duvida.answer_text}
                      </p>

                      {/* Mentorado action to resolve */}
                      {user?.role !== "admin" &&
                        duvida.user_id === user?.id &&
                        duvida.status === "answered" && (
                          <div className="pt-2 pl-6 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkResolved(duvida.id)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Marcar como Dúvida Resolvida
                            </Button>
                          </div>
                        )}
                    </div>
                  ) : (
                    /* Answer Input field for Admin */
                    user?.role === "admin" && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                          <Clock className="h-4 w-4" />
                          <span>Esta dúvida ainda aguarda sua resposta:</span>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Escreva a resposta e orientações técnicas aos mentorados..."
                            value={replyText[duvida.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({ ...prev, [duvida.id]: e.target.value }))
                            }
                            className="min-h-20"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAnswerSubmit(duvida.id)}
                              disabled={replyingId === duvida.id || !replyText[duvida.id]?.trim()}
                            >
                              {replyingId === duvida.id ? "Enviando..." : "Responder Pergunta"}
                              <Send className="ml-1.5 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Empty state for student waiting for reply */}
                  {!duvida.answer_text && user?.role !== "admin" && (
                    <div className="flex items-center gap-2 rounded bg-muted/40 p-3 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>
                        Sua pergunta foi enviada ao Matheus Figueiredo e está aguardando resposta.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function StatusBadge({ status }: { status: Duvida["status"] }) {
  switch (status) {
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
          <CheckCircle2 className="h-3 w-3" />
          Resolvida
        </span>
      );
    case "answered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <MessageSquare className="h-3 w-3" />
          Respondida
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-500">
          <Clock className="h-3 w-3" />
          Pendente
        </span>
      );
  }
}
