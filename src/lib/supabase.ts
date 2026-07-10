import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isPlaceholder = (val: string) => {
  if (!val) return true;
  return (
    val.includes("seu-projeto") ||
    val.includes("sua-anon-key") ||
    val.includes("your-project") ||
    val.trim() === ""
  );
};

// Indica se o usuário alterou os placeholders com chaves válidas reais
export const hasSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey);

// Inicializa o cliente com as credenciais (ou com url/key dummy se não configurado, evitando exceções no import)
export const supabase = createClient(
  hasSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  hasSupabaseConfigured ? supabaseAnonKey : "placeholder-key",
);
