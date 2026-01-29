import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, ChevronDown, ChevronUp, Clock, Timer, LayoutList, Target, Calendar } from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Program } from '@/contexts/ProgramsContext';

interface KanbanColumn {
  id: string;
  titulo: string;
  cards: Program[];
}

const statusColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'nao-instituido': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-200 text-slate-700' },
  'instituido': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-200 text-blue-700' },
  'ativo': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-200 text-emerald-700' },
};

export default function CGProg() {
  const { programs, updateProgram, userRole } = usePrograms();
  const isAdmin = userRole === 'admin';
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const cols: KanbanColumn[] = [
      { id: 'nao-instituido', titulo: 'Não Instituído', cards: [] },
      { id: 'instituido', titulo: 'Instituído', cards: [] },
      { id: 'ativo', titulo: 'Ativo', cards: [] },
    ];

    programs.forEach(prog => {
      const column = cols.find(c => c.id === prog.statusCGProg);
      if (column) {
        column.cards.push(prog);
      }
    });

    return cols;
  }, [programs]);

  const handleDragEnd = async (result: DropResult) => {
    if (!isAdmin) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    await updateProgram(draggableId, { statusCGProg: destination.droppableId as any });
  };

  const toggleChecklistItem = (programId: string, itemId: number) => {
    if (!isAdmin) return;
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const newChecklist = program.checklistCGProg.map(item => {
      if (item.id === itemId) {
        const isNowConcluido = !item.concluido;
        return { 
          ...item, 
          concluido: isNowConcluido,
          dataConclusao: isNowConcluido ? new Date().toISOString().substring(0, 10) : ''
        };
      }
      return item;
    });

    updateProgram(programId, { checklistCGProg: newChecklist });
  };

  const updateItemDate = (programId: string, itemId: number, field: 'dataInicio' | 'dataConclusao', value: string) => {
    if (!isAdmin) return;
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const newChecklist = program.checklistCGProg.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    updateProgram(programId, { checklistCGProg: newChecklist });
  };

  const percentualMedioGeral = Math.round(
    programs.reduce((sum, p) => sum + (p.percentualCGProg || 0), 0) / (programs.length || 1)
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comitês Gestores (CGProgs)</h1>
          <p className="text-slate-500 mt-1">Gestão do Plano de Ação e Carta de Compromisso (Etapa 2).</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
          <LayoutList className="w-4 h-4" />
          <span className="text-sm font-semibold">{programs.length} Comitês Ativos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Target className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progresso Médio</p>
                <p className="text-2xl font-black text-slate-900">{percentualMedioGeral}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><CheckSquare className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-blue-600/60 uppercase tracking-wider">Etapas Totais</p>
                <p className="text-2xl font-black text-blue-700">10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 shadow-sm bg-emerald-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Calendar className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">Fase Atual</p>
                <p className="text-2xl font-black text-emerald-700">Execução</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <h3 className="font-bold text-slate-700 mb-4 px-1 flex items-center gap-2">
                {column.titulo} <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{column.cards.length}</span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 min-h-[600px] p-3 rounded-xl border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="space-y-4">
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`group p-4 rounded-xl border shadow-sm transition-all ${statusColors[card.statusCGProg].bg} ${statusColors[card.statusCGProg].border} ${snapshot.isDragging ? 'shadow-xl rotate-2 z-50' : 'hover:shadow-md'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-bold text-sm leading-tight ${statusColors[card.statusCGProg].text}`}>{card.nome}</h4>
                                <button onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)} className="p-1 hover:bg-white/50 rounded">
                                  {expandedCardId === card.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </button>
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                  <Clock className="w-3 h-3" /> {card.percentualCGProg}% Etapa 2
                                </div>
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${card.percentualCGProg}%` }} />
                                </div>
                              </div>

                              {expandedCardId === card.id && (
                                <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-4 animate-in fade-in duration-300">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Checklist CGProg</p>
                                    {card.checklistCGProg.map(item => (
                                      <div key={item.id} className="bg-white/40 p-2 rounded-lg border border-slate-200/30 space-y-2">
                                        <div className="flex items-start gap-2">
                                          <button 
                                            onClick={() => isAdmin && toggleChecklistItem(card.id, item.id)} 
                                            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${item.concluido ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300'} ${!isAdmin ? 'cursor-default' : ''}`}
                                          >
                                            {item.concluido && <CheckSquare className="w-3 h-3" />}
                                          </button>
                                          <span className={`text-[11px] leading-tight flex-1 ${item.concluido ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{item.descricao}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pl-6">
                                          <div className="space-y-1">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">Início</label>
                                            <input 
                                              type="date" 
                                              value={item.dataInicio || ''} 
                                              onChange={(e) => isAdmin && updateItemDate(card.id, item.id, 'dataInicio', e.target.value)} 
                                              className={`w-full text-[10px] p-1 border border-slate-200 rounded bg-white/50 outline-none ${!isAdmin ? 'cursor-default' : ''}`}
                                              readOnly={!isAdmin}
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">Fim</label>
                                            <input 
                                              type="date" 
                                              value={item.dataConclusao || ''} 
                                              onChange={(e) => isAdmin && updateItemDate(card.id, item.id, 'dataConclusao', e.target.value)} 
                                              className={`w-full text-[10px] p-1 border border-slate-200 rounded bg-white/50 outline-none ${!isAdmin ? 'cursor-default' : ''}`}
                                              readOnly={!isAdmin}
                                            />
                                          </div>
                                        </div>
                                        {item.prazoDias ? (
                                          <div className="pl-6 flex items-center gap-1 text-blue-600 font-bold text-[9px] uppercase">
                                            <Timer className="w-3 h-3" /> Prazo: {item.prazoDias} dias
                                          </div>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
