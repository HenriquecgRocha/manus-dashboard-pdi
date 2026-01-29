import React from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface Process {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  owner: string;
  dueDate: string;
}

const processes: Process[] = [
  {
    id: '1',
    name: 'Coleta de Dados - Fluxo Top-Down',
    description: 'Requisicao de dados a GIPDI/SIPDI e GGPJ/SQA',
    status: 'completed',
    progress: 100,
    owner: 'SGPG',
    dueDate: '2025-02-10',
  },
  {
    id: '2',
    name: 'Consolidacao de Dados - Google Planilha',
    description: 'Unificacao de informacoes de multiplas fontes',
    status: 'in-progress',
    progress: 75,
    owner: 'SGPG',
    dueDate: '2025-02-15',
  },
  {
    id: '3',
    name: 'Validacao de Dados - Formularios Google Forms',
    description: 'Coleta de dados complementares dos liders de SI',
    status: 'in-progress',
    progress: 60,
    owner: 'SGPG',
    dueDate: '2025-02-20',
  },
  {
    id: '4',
    name: 'Nomeacao de GTs',
    description: 'Publicacao de Ordens de Servico no BCA',
    status: 'in-progress',
    progress: 80,
    owner: 'SGPG + DEPD',
    dueDate: '2025-02-25',
  },
  {
    id: '5',
    name: 'Geracao de Dashboards - Looker Studio',
    description: 'Criacao de paineis de acompanhamento',
    status: 'pending',
    progress: 30,
    owner: 'SGPG',
    dueDate: '2025-03-05',
  },
  {
    id: '6',
    name: 'Integracao de Sistemas - ETL',
    description: 'Automacao de coleta de dados entre sistemas',
    status: 'pending',
    progress: 10,
    owner: 'SGPG + TI',
    dueDate: '2025-03-15',
  },
];

const statusIcons = {
  completed: <CheckCircle2 className="w-5 h-5 text-secondary" />,
  'in-progress': <Clock className="w-5 h-5 text-primary" />,
  pending: <AlertCircle className="w-5 h-5 text-destructive" />,
};

const statusLabels = {
  completed: 'Concluido',
  'in-progress': 'Em andamento',
  pending: 'Pendente',
};

export default function SGPG() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-foreground mb-2">Acompanhamento SGPG</h1>
        <p className="text-muted-foreground">
          Processos operacionais e indicadores de desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Processos Concluidos</h3>
            <CheckCircle2 className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-3xl font-bold text-secondary mb-2">1</p>
          <p className="text-xs text-muted-foreground">de 6 processos</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Em Andamento</h3>
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary mb-2">3</p>
          <p className="text-xs text-muted-foreground">de 6 processos</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Pendentes</h3>
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive mb-2">2</p>
          <p className="text-xs text-muted-foreground">de 6 processos</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-border bg-muted/30">
          <h2 className="heading-lg text-foreground">Processos Operacionais</h2>
        </div>

        <div className="divide-y divide-border">
          {processes.map((process) => (
            <div key={process.id} className="px-8 py-6 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{statusIcons[process.status]}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{process.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{process.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Responsavel: {process.owner}</span>
                      <span>Prazo: {process.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground mb-1">{process.progress}%</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      process.status === 'completed'
                        ? 'bg-secondary/20 text-secondary'
                        : process.status === 'in-progress'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {statusLabels[process.status]}
                  </span>
                </div>
              </div>

              <div className="w-full bg-border rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    process.status === 'completed'
                      ? 'bg-secondary'
                      : process.status === 'in-progress'
                        ? 'bg-primary'
                        : 'bg-destructive'
                  }`}
                  style={{ width: `${process.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="heading-lg text-foreground mb-6">Indicadores de Eficiencia</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tempo Medio de Consolidacao</span>
                <span className="text-sm font-bold text-primary">3.2 dias</span>
              </div>
              <p className="text-xs text-muted-foreground">vs. 5 dias (meta)</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Taxa de Completude de Dados</span>
                <span className="text-sm font-bold text-secondary">94%</span>
              </div>
              <p className="text-xs text-muted-foreground">vs. 90% (meta)</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tempo Medio de Nomeacao de GT</span>
                <span className="text-sm font-bold text-accent">8.5 dias</span>
              </div>
              <p className="text-xs text-muted-foreground">vs. 10 dias (meta)</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Taxa de Retrabalho</span>
                <span className="text-sm font-bold text-destructive">12%</span>
              </div>
              <p className="text-xs text-muted-foreground">vs. 5% (meta)</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="heading-lg text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Tendencias
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className="text-sm font-medium text-foreground mb-1">Melhoria em Automacao</p>
              <p className="text-xs text-muted-foreground">
                Implementacao de ETL reduziria tempo de consolidacao em 60%
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground mb-1">Padronizacao de Dados</p>
              <p className="text-xs text-muted-foreground">
                Formularios estruturados aumentariam completude para 98%
              </p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm font-medium text-foreground mb-1">Monitoramento em Tempo Real</p>
              <p className="text-xs text-muted-foreground">
                Dashboard interativo permitiria intervencoes proativas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
