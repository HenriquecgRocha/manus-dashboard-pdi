import React, { ReactNode } from 'react';
import { Menu, X, Wifi, WifiOff, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';
import { usePrograms } from '@/contexts/ProgramsContext';

interface DashboardLayoutProps {
  children: ReactNode;
  activeNav: string;
  onNavChange: (nav: string) => void;
  onLogout?: () => void;
}

export default function DashboardLayout({ children, activeNav, onNavChange, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isOnline, clearLocalCache } = usePrograms();

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'programs', label: 'Programas', icon: '📋' },
    { id: 'gts', label: 'Grupos de Trabalho', icon: '👥' },
    { id: 'cgprog', label: 'CGProgs', icon: '👨‍💼' },
    { id: 'timeline', label: 'Cronograma', icon: '📅' },
    { id: 'sgpg', label: 'SGPG', icon: '⚙️' },
    { id: 'auditlog', label: 'Histórico', icon: '📝' },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('temp_user_v4');
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Verde Embrapa */}
      <aside
        style={{ backgroundColor: '#1B7E3B' }}
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        {/* Logo/Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-center bg-white rounded-2xl p-1 h-28 shadow-inner">
            <img 
              src="/embrapa-logo.png" 
              alt="Embrapa" 
              className="h-full w-full object-contain px-2"
            />
          </div>
        </div>

        {/* Status de Conexão */}
        <div className="px-4 py-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {sidebarOpen && (isOnline ? 'Servidor Online' : 'Servidor Offline')}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeNav === item.id
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-white hover:bg-emerald-700/40'
              }`}
              title={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 space-y-1 border-t border-emerald-700/50">
          <button
            onClick={clearLocalCache}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-100 hover:bg-emerald-700/40 transition-colors"
            title="Limpar Cache e Sincronizar"
          >
            <RefreshCw className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-medium">Sincronizar Agora</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-100 hover:bg-red-500/20 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-medium">Sair do Sistema</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-3 mt-2 rounded-lg hover:bg-emerald-700/40 transition-colors text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {!isOnline && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] py-1 text-center font-bold z-50 animate-pulse">
            VOCÊ ESTÁ OFFLINE - AS ALTERAÇÕES NÃO SERÃO SALVAS NO SERVIDOR
          </div>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
