import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="text-center space-y-4">
        <Loader2 className="animate-spin mx-auto w-10 h-10 text-emerald-600" />
        <h1 className="text-2xl font-bold">Carregando Painel de PD&I...</h1>
        <Button variant="default" onClick={() => window.location.href = '/'}>Ir para o Início</Button>
      </main>
    </div>
  );
}
