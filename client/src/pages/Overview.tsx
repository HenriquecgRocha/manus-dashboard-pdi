import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Program } from '@/contexts/ProgramsContext';

export default function Overview() {
  const { programs } = usePrograms();
  
  const totalPrograms = programs.length;
  const topDownPrograms = programs.filter(p => p.tipo === 'top-down').length;
  const bottomUpPrograms = programs.filter(p => p.tipo === 'bottom-up').length;
  
  const namedGTs = programs.filter(p => p.statusGT === 'concluido').length;
  const institutedCGProgs = programs.filter(p => p.statusCGProg === 'ativo').length;
  
  const calculateProg = (prog: Program): number => {
    let totalProgress = 0;
    const getVal = (status: any) => {
      if (status === true || status === 'concluido' || status === 'ativo') return 16.66;
      if (status === 'em-atividade' || status === 'instituido' || status === 'em-andamento') return 8.33;
      return 0;
    };
    
    totalProgress += getVal(prog.statusGT);
    totalProgress += getVal(prog.documentoSintese);
    totalProgress += getVal(prog.parecerTecnico);
    totalProgress += getVal(prog.statusCGProg);
    totalProgress += getVal(prog.cartaCompromissoElaborada);
    totalProgress += getVal(prog.cartaCompromissoAnalisada);
    
    return Math.round(totalProgress);
  };

  const completedPrograms = programs.filter(p => calculateProg(p) === 100).length;
  const inProgressPrograms = programs.filter(p => calculateProg(p) > 0 && calculateProg(p) < 100).length;
  const notStartedPrograms = programs.filter(p => calculateProg(p) === 0).length;
  
  const avgCompletion = totalPrograms > 0 ? Math.round(
    programs.reduce((sum, p) => sum + calculateProg(p), 0) / totalPrograms
  ) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-foreground mb-2">Visão Geral do Acompanhamento</h1>
        <p className="text-muted-foreground">
          Monitoramento da estruturação de Programas de PD&I - Etapa 1 ({totalPrograms} Programas)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Programas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{totalPrograms}</span>
              <span className="text-xs text-muted-foreground">({topDownPrograms} top-down + {bottomUpPrograms} bottom-up)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">GTs Nomeados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{namedGTs}</span>
              <span className="text-xs text-muted-foreground">de {totalPrograms}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">CGProgs Instituídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{institutedCGProgs}</span>
              <span className="text-xs text-muted-foreground">de {totalPrograms}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{avgCompletion}%</span>
              <span className="text-xs text-muted-foreground">de conclusão</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progresso por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Concluídos (100%)</span>
              <span className="font-bold">{completedPrograms}</span>
            </div>
            <div className="flex justify-between">
              <span>Em Andamento</span>
              <span className="font-bold">{inProgressPrograms}</span>
            </div>
            <div className="flex justify-between">
              <span>Não Iniciados</span>
              <span className="font-bold">{notStartedPrograms}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Status de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Documentos Síntese Elaborados</span>
              <span className="font-bold">{programs.filter(p => p.documentoSintese === 'concluido').length}/{totalPrograms}</span>
            </div>
            <div className="flex justify-between">
              <span>Sínteses Analisadas</span>
              <span className="font-bold">{programs.filter(p => p.parecerTecnico === 'concluido').length}/{totalPrograms}</span>
            </div>
            <div className="flex justify-between">
              <span>Cartas de Compromisso Elaboradas</span>
              <span className="font-bold">{programs.filter(p => p.cartaCompromissoElaborada === 'concluido').length}/{totalPrograms}</span>
            </div>
            <div className="flex justify-between">
              <span>Cartas de Compromisso Analisadas</span>
              <span className="font-bold">{programs.filter(p => p.cartaCompromissoAnalisada === 'concluido').length}/{totalPrograms}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
