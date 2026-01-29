import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { List, LayoutGrid, Timer, CheckCircle2 } from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramsContext';
import { parseISO, isValid, getMonth, differenceInDays, startOfDay, format } from 'date-fns';

export default function Timeline() {
  const { programs } = usePrograms();
  const [filter, setFilter] = useState<'all' | 'concluido' | 'pendente'>('all');
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [focalFilter, setFocalFilter] = useState<string>('all');

  // Extrair todas as atividades de ambos os checklists com proteção total
  const allActivities = useMemo(() => {
    const activities: any[] = [];
    if (!programs || !Array.isArray(programs)) return [];

    programs.forEach(prog => {
      const processItem = (item: any, origin: string) => {
        // Proteção contra item nulo ou sem descrição
        if (!item || !item.descricao) return;

        // Incluir todas as atividades (com ou sem datas)
        activities.push({
          ...item,
          origin,
          programName: prog.nome || 'Sem Nome',
          programId: prog.id,
          pontoFocal: prog.pontoFocalSGPG || 'A designar',
          status: item.concluido ? 'concluido' : (item.dataInicio ? 'em-andamento' : 'pendente')
        })
      };

      (prog.checklist || []).forEach(item => processItem(item, 'GT'));
      (prog.checklistCGProg || []).forEach(item => processItem(item, 'CGProg'));
    });

    return activities.sort((a, b) => {
      const dateA = a.dataInicio || a.dataConclusao || '9999-12-31';
      const dateB = b.dataInicio || b.dataConclusao || '9999-12-31';
      return dateA.localeCompare(dateB);
    });
  }, [programs]);

  const focalPoints = useMemo(() => {
    const points = new Set<string>();
    allActivities.forEach(act => {
      if (act.pontoFocal) points.add(act.pontoFocal);
    });
    return Array.from(points).sort();
  }, [allActivities]);

  const filteredActivities = allActivities.filter(act => {
    const matchesStatus = filter === 'all' || (filter === 'concluido' ? act.concluido : !act.concluido);
    const matchesFocal = focalFilter === 'all' || act.pontoFocal === focalFilter;
    return matchesStatus && matchesFocal;
  });

  const stats = {
    total: allActivities.length,
    concluidas: allActivities.filter(a => a.concluido).length,
    pendentes: allActivities.filter(a => !a.concluido).length
  };

  const ganttMonths = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map(m => ({ name: m }));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cronograma Integrado</h1>
          <p className="text-slate-500 mt-1">Acompanhamento visual de todas as etapas de PD&I.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('gantt')} className={`p-2 rounded-lg transition-all ${viewMode === 'gantt' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Todas ({stats.total})</button>
            <button onClick={() => setFilter('concluido')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'concluido' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Concluídas ({stats.concluidas})</button>
            <button onClick={() => setFilter('pendente')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'pendente' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Em Aberto ({stats.pendentes})</button>
          </div>
          <select 
            value={focalFilter} 
            onChange={(e) => setFocalFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos Pontos Focais</option>
            {focalPoints.map(fp => (
              <option key={fp} value={fp}>{fp}</option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'gantt' ? (
        <Card className="border-slate-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <div className="w-64 p-4 border-r border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">Atividade / Programa</div>
                <div className="w-40 p-4 border-r border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">Ponto Focal</div>
                <div className="flex-1 flex">
                  {ganttMonths.map((m, i) => (
                    <div key={i} className="flex-1 p-4 text-center border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase">{m.name}</div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {filteredActivities.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 italic">Nenhuma atividade para exibir.</div>
                ) : (
                  filteredActivities.map((act, idx) => {
                    // Lógica segura para datas usando date-fns
                    const dInicio = act.dataInicio ? parseISO(act.dataInicio) : null;
                    const dFim = act.dataConclusao ? parseISO(act.dataConclusao) : null;
                    
                    const startMonth = dInicio && isValid(dInicio) ? getMonth(dInicio) : (dFim && isValid(dFim) ? getMonth(dFim) : 0);
                    const endMonth = dFim && isValid(dFim) ? getMonth(dFim) : startMonth;
                    const duration = Math.max(1, endMonth - startMonth + 1);

                    // Cálculo do tempo restante
                    const today = startOfDay(new Date());
                    let remainingDays = 0;
                    if (dFim && isValid(dFim) && !act.concluido) {
                      remainingDays = differenceInDays(dFim, today);
                    }

                    return (
                      <div key={idx} className="flex hover:bg-slate-50/50 transition-colors group">
                        <div className="w-64 p-4 border-r border-slate-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${act.concluido ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[11px] font-bold text-slate-700 truncate">{act.descricao}</span>
                          </div>
                          <div className="flex items-center justify-between pl-4">
                            <div className="text-[9px] text-slate-400 font-medium truncate">{act.programName}</div>
                            {!act.concluido && dFim && isValid(dFim) && (
                              <div className="flex flex-col">
                                <div className={`text-[9px] font-bold flex items-center gap-1 ${remainingDays < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                  <Timer className="w-2.5 h-2.5" /> {remainingDays < 0 ? `Atrasado ${Math.abs(remainingDays)}d` : `${remainingDays}d restantes`}
                                </div>
                                <div className="text-[8px] text-slate-400 font-medium ml-3.5">
                                  Entrega: {format(dFim, 'dd/MM/yyyy')}
                                </div>
                              </div>
                            )}
                            {act.concluido && (
                              <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Concluído
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-40 p-4 border-r border-slate-100">
                          <div className="text-[9px] font-medium text-slate-700 truncate">{act.pontoFocal}</div>
                        </div>
                        <div className="flex-1 flex relative py-4">
                          {ganttMonths.map((_, i) => <div key={i} className="flex-1 border-r border-slate-50/50" />)}
                          <div 
                            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded-md shadow-sm flex items-center px-2 overflow-hidden transition-all group-hover:shadow-md ${act.concluido ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}
                            style={{ left: `${(startMonth / 12) * 100}%`, width: `${(duration / 12) * 100}%` }}
                          >
                            <span className="text-[9px] font-bold text-white truncate">
                              {act.concluido ? 'CONCLUÍDO' : (dFim && isValid(dFim) ? (remainingDays < 0 ? `ATRASADO ${Math.abs(remainingDays)}D` : `${remainingDays}D RESTANTES`) : 'EM ANDAMENTO')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act, idx) => (
            <Card key={idx} className={`border-l-4 ${act.concluido ? 'border-l-emerald-500' : 'border-l-amber-500'} hover:shadow-md transition-all`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${act.concluido ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{act.origin}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400">{act.dataConclusao || act.dataInicio}</span>
                    {!act.concluido && act.dataConclusao && (
                      <span className={`text-[9px] font-bold flex items-center gap-1 mt-1 ${differenceInDays(parseISO(act.dataConclusao), startOfDay(new Date())) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        <Timer className="w-2.5 h-2.5" /> {differenceInDays(parseISO(act.dataConclusao), startOfDay(new Date())) < 0 ? `Atrasado ${Math.abs(differenceInDays(parseISO(act.dataConclusao), startOfDay(new Date())))}d` : `${differenceInDays(parseISO(act.dataConclusao), startOfDay(new Date()))}d restantes`}
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{act.descricao}</h4>
                <p className="text-[11px] text-slate-500 truncate">{act.programName}</p>
                <p className="text-[10px] text-slate-600 font-medium mt-2"><strong>PF:</strong> {act.pontoFocal}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
