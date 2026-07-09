import { cn } from "@/lib/utils";

/**
 * Wordmark estilizado — "TikTok Growth".
 *
 * Substitui a logo real enquanto o Samuel não envia o arquivo final.
 * "Growth" recebe o gradiente da marca (primary → accent).
 * Aceita tamanho (`sm | md | lg | xl`) e `as` (polimórfico, default `span`).
 *
 * Trocar pela <img> da logo oficial é só substituir o uso nos call-sites.
 */
export type WordmarkSize = "sm" | "md" | "lg" | "xl";

const sizeClassMap: Record<WordmarkSize, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-5xl md:text-6xl",
};

const weightClassMap: Record<WordmarkSize, string> = {
  sm: "font-semibold",
  md: "font-bold",
  lg: "font-extrabold",
  xl: "font-extrabold",
};

export interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
  /** Mostrar badge "Amplify" à direita (default true para lg/xl). */
  withBadge?: boolean;
  as?: "span" | "div" | "h1" | "h2" | "h3";
}

export function Wordmark({
  size = "md",
  className,
  withBadge,
  as: Tag = "span",
}: WordmarkProps) {
  const showBadge = withBadge ?? (size === "lg" || size === "xl");

  return (
    <Tag
      className={cn(
        "inline-flex items-baseline gap-2 font-sans leading-none",
        sizeClassMap[size],
        className,
      )}
    >
      <span className={cn("tracking-tight text-foreground", weightClassMap[size])}>
        TikTok
      </span>
      <span
        className={cn(
          "tracking-tight text-brand-gradient italic",
          weightClassMap[size],
        )}
      >
        Growth
      </span>
      {showBadge && (
        <span
          className={cn(
            "ml-1 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 align-middle text-[0.55em] font-semibold uppercase tracking-wider text-primary",
            size === "xl" ? "px-3 py-1" : "",
          )}
        >
          Amplify
        </span>
      )}
    </Tag>
  );
}

export default Wordmark;
