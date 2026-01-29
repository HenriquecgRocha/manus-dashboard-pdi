import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, Users, User, CheckSquare, ChevronDown, ChevronUp, Clock, Timer } from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Program } from '@/contexts/ProgramsContext';

interface KanbanColumn {
  id: string;
  titulo: string;
  cards: Program[];
}

const statusColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'nao-nomeado': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-200 text-slate-700' },
  'em-atividade': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-200 text-amber-700' },
  'concluido': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-200 text-emerald-700' },
};

export default function GTs() {
  const { programs, updateProgram, userRole } = usePrograms();
  const isAdmin = userRole === 'admin';
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Program>>({});

  const columns = useMemo(() => {
    const cols: KanbanColumn[] = [
      { id: 'nao-nomeado', titulo: 'Não Nomeados', cards: [] },
      { id: 'em-atividade', titulo: 'Em Atividade', cards: [] },
      { id: 'concluido', titulo: 'Concluído', cards: [] },
    ];

    programs.forEach(prog => {
      const column = cols.find(c => c.id === prog.statusGT);
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
    
    await updateProgram(draggableId, { statusGT: destination.droppableId as any });
  };

  const toggleChecklistItem = (programId: string, itemId: number) => {
    if (!isAdmin) return;
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const newChecklist = program.checklist.map(item => {
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

    updateProgram(programId, { checklist: newChecklist });
  };

  const updateItemDate = (programId: string, itemId: number, field: 'dataInicio' | 'dataConclusao', value: string) => {
    if (!isAdmin) return;
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const newChecklist = program.checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    updateProgram(programId, { checklist: newChecklist });
  };

  const startEdit = (program: Program) => {
    setEditingCardId(program.id);
    setEditValues({ ...program });
  };

  const saveEdit = async () => {
    if (!editingCardId) return;
    await updateProgram(editingCardId, editValues);
    setEditingCardId(null);
    setEditValues({});
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grupos de Trabalho (GTs)</h1>
          <p className="text-slate-500 mt-1">Gerencie o checklist e o cronograma de cada GT.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100">
          <Users className="w-4 h-4" />
          <span className="text-sm font-semibold">{programs.length} Programas Ativos</span>
        </div>
      </div>

      {editingCardId && (
        <Card className="border-emerald-200 bg-emerald-50/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" /> Editar Programa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
              <input type="text" value={editValues.nome || ''} onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coordenador</label>
              <input type="text" value={editValues.coordenador || ''} onChange={(e) => setEditValues({ ...editValues, coordenador: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={saveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2" /> Salvar</Button>
              <Button onClick={() => setEditingCardId(null)} variant="outline"><X className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <h3 className="font-bold text-slate-700 mb-4 px-1 flex items-center gap-2">
                {column.titulo} <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{column.cards.length}</span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 min-h-[600px] p-3 rounded-xl border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="space-y-4">
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`group p-4 rounded-xl border shadow-sm transition-all ${statusColors[card.statusGT].bg} ${statusColors[card.statusGT].border} ${snapshot.isDragging ? 'shadow-xl rotate-2 z-50' : 'hover:shadow-md'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-bold text-sm leading-tight ${statusColors[card.statusGT].text}`}>{card.nome}</h4>
                                <div className="flex gap-1">
                                  {isAdmin && (
                                    <button onClick={() => startEdit(card)} className="p-1 hover:bg-white/50 rounded"><Edit2 className="w-3 h-3 text-slate-500" /></button>
                                  )}
                                  <button onClick={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)} className="p-1 hover:bg-white/50 rounded">
                                    {expandedCardId === card.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                  <Clock className="w-3 h-3" /> {card.percentualConclusao}% concluído
                                </div>
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${card.percentualConclusao}%` }} />
                                </div>
                              </div>

                              {expandedCardId === card.id && (
                                <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-4 animate-in fade-in duration-300">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Checklist de Atividades</p>
                                    {card.checklist.map(item => (
                                      <div key={item.id} className="bg-white/40 p-2 rounded-lg border border-slate-200/30 space-y-2">
                                        <div className="flex items-start gap-2">
                                          <button 
                                            onClick={() => isAdmin && toggleChecklistItem(card.id, item.id)} 
                                            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${item.concluido ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'} ${!isAdmin ? 'cursor-default' : ''}`}
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

                                        {item.descricao === "Elaboração do Documento Síntese do Programa (GT)" && card.checklistSintese && (
                                          <div className="mt-3 pl-6 space-y-2 border-l-2 border-emerald-100 ml-2">
                                            <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Itens do Documento Síntese</p>
                                            {card.checklistSintese.map(subItem => (
                                              <div key={subItem.id} className="flex items-start gap-2">
                                                <button 
                                                  onClick={() => {
                                                    if (!isAdmin) return;
                                                    const newSintese = card.checklistSintese.map(si => 
                                                      si.id === subItem.id ? { ...si, concluido: !si.concluido } : si
                                                    );
                                                    updateProgram(card.id, { checklistSintese: newSintese });
                                                  }}
                                                  className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${subItem.concluido ? 'bg-emerald-400 border-emerald-400 text-white' : 'bg-white border-slate-200'} ${!isAdmin ? 'cursor-default' : ''}`}
                                                >
                                                  {subItem.concluido && <CheckSquare className="w-2.5 h-2.5" />}
                                                </button>
                                                <span className={`text-[10px] leading-tight ${subItem.concluido ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{subItem.descricao}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {!expandedCardId && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <User className="w-3 h-3" /> <span className="truncate">{card.coordenador || 'A designar'}</span>
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
