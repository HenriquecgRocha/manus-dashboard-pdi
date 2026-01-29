import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProgramsProvider } from "./contexts/ProgramsContext";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import Programs from "./pages/Programs";
import GTs from "./pages/GTs";
import CGProg from "./pages/CGProg";
import AuditLog from "./pages/AuditLog";
import SGPG from "./pages/SGPG";
import Timeline from "./pages/Timeline";
import { useState, useEffect } from "react";

function Router() {
  const [activeNav, setActiveNav] = useState('overview');
  const [tempUser, setTempUser] = useState(() => {
    const saved = localStorage.getItem('temp_user_v4');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const ADMIN_EMAILS = [
    'cassio.wilbert@embrapa.br',
    'debora.marques@embrapa.br',
    'henrique.rocha@embrapa.br',
    'kelly.cohen@embrapa.br'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(email);

    if (isAdmin) {
      const savedPasswords = JSON.parse(localStorage.getItem('pdi_passwords') || '{}');
      if (!savedPasswords[email]) {
        if (!isFirstAccess) {
          setIsFirstAccess(true);
          return;
        }
        if (loginPassword.length < 4) {
          alert("A senha deve ter pelo menos 4 caracteres.");
          return;
        }
        savedPasswords[email] = loginPassword;
        localStorage.setItem('pdi_passwords', JSON.stringify(savedPasswords));
      } else if (savedPasswords[email] !== loginPassword) {
        alert("Senha incorreta.");
        return;
      }
    }

    const user = { 
      name: email.split('@')[0].replace('.', ' '), 
      id: Date.now(),
      email: email,
      role: isAdmin ? 'admin' : 'viewer'
    };
    setTempUser(user);
    localStorage.setItem('temp_user_v4', JSON.stringify(user));
  };

  const handleLogout = () => {
    setTempUser(null);
    localStorage.removeItem('temp_user_v4');
    setLoginEmail('');
    setLoginPassword('');
    setIsFirstAccess(false);
  };

  const handleGuestAccess = () => {
    const user = { 
      name: 'Visitante', 
      id: Date.now(),
      email: 'visitante@publico.com',
      role: 'viewer'
    };
    setTempUser(user);
    localStorage.setItem('temp_user_v4', JSON.stringify(user));
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'overview': return <Overview />;
      case 'programs': return <Programs />;
      case 'gts': return <GTs />;
      case 'cgprog': return <CGProg />;
      case 'auditlog': return <AuditLog />;
      case 'sgpg': return <SGPG />;
      case 'timeline': return <Timeline />;
      default: return <Overview />;
    }
  };

  if (!tempUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white border border-slate-200 rounded-2xl shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel de PD&I (v19 - Restaurado)</h1>
            <p className="text-slate-500">Identifique-se para acessar o sistema de acompanhamento</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">E-mail Corporativo</label>
              <input
                type="email"
                placeholder="seu.nome@embrapa.br"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
                autoFocus
                disabled={isFirstAccess}
              />
            </div>
            
            {(ADMIN_EMAILS.includes(loginEmail.trim().toLowerCase()) || isFirstAccess) && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-slate-700">
                  {isFirstAccess ? "Cadastre sua Senha (Primeiro Acesso)" : "Senha"}
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              {isFirstAccess ? "Cadastrar e Acessar" : "Acessar Painel"}
            </button>

            {!isFirstAccess && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">Ou</span>
                </div>
              </div>
            )}

            {!isFirstAccess && (
              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Acessar apenas para Visualização
              </button>
            )}
            
            {isFirstAccess && (
              <button 
                type="button"
                onClick={() => { setIsFirstAccess(false); setLoginPassword(''); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                Voltar
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout activeNav={activeNav} onNavChange={setActiveNav} onLogout={handleLogout}>
          {renderPage()}
        </DashboardLayout>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ProgramsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ProgramsProvider>
    </ThemeProvider>
  );
}

export default App;
