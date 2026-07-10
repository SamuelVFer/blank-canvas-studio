// Re-exporta o cliente gerenciado do Lovable Cloud.
// Mantido aqui para compatibilidade com o restante do app que importa de "@/lib/supabase".
export { supabase } from "@/integrations/supabase/client";

// O Cloud está sempre configurado quando este módulo é importado.
export const hasSupabaseConfigured = true;
