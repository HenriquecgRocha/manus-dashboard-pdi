import { cn } from "@/lib/utils";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
};

export function AIChatBox({
  className,
  height = "600px",
}: AIChatBoxProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm items-center justify-center",
        className
      )}
      style={{ height }}
    >
      <p className="text-slate-400">Chat de IA desativado nesta versão</p>
    </div>
  );
}
