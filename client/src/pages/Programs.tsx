import React, { useState } from 'react';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, Eye, Plus } from 'lucide-react';
import { Program } from '@/contexts/ProgramsContext';
import { createInitialChecklist, createInitialCGProgChecklist, createInitialSinteseChecklist } from '@/data/programsData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Programs() {
  const { programs, updateProgram, addProgram, userRole } = usePrograms();
  const isAdmin = userRole === 'admin';
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramType, setNewProgramType] = useState<'top-down' | 'bottom-up'>('top-down');

  const handleAddProgram = async () => {
    if (!newProgramName.trim()) return;
    await addProgram({
      nome: newProgramName,
      tipo: newProgramType
    });
    setIsAddDialogOpen(false);
    setNewProgramName('');
  };
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Program>>({});

  const startEdit = (program: Program) => {
    setEditingId(program.id);
    setEditValues({ ...program });
  };

  const saveEdit = (programId: string) => {
    updateProgram(programId, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getStatusValue = (status: any): number => {
    if (status === true || status === 'concluido' || status === 'ativo') return 16.66; // ✓ = 16.66%
    if (status === 'em-atividade' || status === 'instituido' || status === 'em-andamento') return 8.33; // ⏳ = 8.33%
    return 0; // ✗ = 0%
  };

  const getStatusIcon = (status: any): React.ReactNode => {
    if (status === true || status === 'concluido' || status === 'ativo') return <span className="text-emerald-600 font-bold">✓</span>;
    if (status === 'em-atividade' || status === 'instituido' || status === 'em-andamento') return <span className="animate-pulse">⏳</span>;
    return <span className="text-slate-300">✗</span>;
  };

  const calculateProgress = (prog: Program): number => {
    let totalProgress = 0;
    
    // Calcular progresso de cada campo
    totalProgress += getStatusValue(prog.statusGT);
    totalProgress += getStatusValue(prog.documentoSintese);
    totalProgress += getStatusValue(prog.parecerTecnico);
    totalProgress += getStatusValue(prog.statusCGProg);
    totalProgress += getStatusValue(prog.cartaCompromissoElaborada);
    totalProgress += getStatusValue(prog.cartaCompromissoAnalisada);
    
    return Math.round(totalProgress);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg text-foreground mb-2">Programas de PD&I</h1>
          <p className="text-muted-foreground">Acompanhamento de estruturação - 12 programas (6 top-down + 6 bottom-up)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Tabela
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Cards
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Programa
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Programa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Programa</Label>
              <Input
                id="name"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                placeholder="Ex: REGEN - Conservação..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={newProgramType}
                onChange={(e) => setNewProgramType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="top-down">Top-Down</option>
                <option value="bottom-up">Bottom-Up</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddProgram} className="bg-emerald-600 hover:bg-emerald-700">Criar Programa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewMode === 'table' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Programa</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold">Coordenador / Ponto Focal SGPG</th>
                    <th className="text-center py-3 px-4 font-semibold">GT</th>
                    <th className="text-center py-3 px-4 font-semibold">Síntese</th>
                    <th className="text-center py-3 px-4 font-semibold">Parecer</th>
                    <th className="text-center py-3 px-4 font-semibold">CGProg</th>
                    <th className="text-center py-3 px-4 font-semibold">Carta Elab.</th>
                    <th className="text-center py-3 px-4 font-semibold">Carta Analis.</th>
                    <th className="text-center py-3 px-4 font-semibold">Progresso</th>
                    <th className="text-center py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((prog) => (
                    <tr key={prog.id} className="border-b border-border hover:bg-muted/50">
                      {editingId === prog.id ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={editValues.nome || ''}
                              onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={editValues.tipo || prog.tipo}
                              onChange={(e) => setEditValues({ ...editValues, tipo: e.target.value as 'top-down' | 'bottom-up' })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            >
                              <option value="top-down">Top-Down</option>
                              <option value="bottom-up">Bottom-Up</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editValues.coordenador || ''}
                                onChange={(e) => setEditValues({ ...editValues, coordenador: e.target.value })}
                                placeholder="Coordenador"
                                className="w-full px-2 py-1 text-sm border rounded"
                              />
                              <input
                                type="text"
                                value={editValues.pontoFocalSGPG || ''}
                                onChange={(e) => setEditValues({ ...editValues, pontoFocalSGPG: e.target.value })}
                                placeholder="Ponto Focal SGPG"
                                className="w-full px-2 py-1 text-sm border rounded"
                              />
                            </div>
                          </td>
                          <td colSpan={8} className="py-3 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" onClick={() => saveEdit(prog.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 font-medium">{prog.nome}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded ${prog.tipo === 'top-down' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {prog.tipo === 'top-down' ? 'Top-Down' : 'Bottom-Up'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium">{prog.coordenador || 'A designar'}</div>
                            <div className="text-xs text-muted-foreground">PF: {prog.pontoFocalSGPG || 'A designar'}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const newStatus = prog.statusGT === 'concluido' ? 'em-atividade' : prog.statusGT === 'em-atividade' ? 'nao-nomeado' : 'concluido';
                                updateProgram(prog.id, { statusGT: newStatus });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ✓ → ⏳ → ✗" : ""}
                            >
                              {getStatusIcon(prog.statusGT)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const next: Record<string, any> = { 'nao-iniciado': 'em-andamento', 'em-andamento': 'concluido', 'concluido': 'nao-iniciado' };
                                updateProgram(prog.id, { documentoSintese: next[prog.documentoSintese as string] || 'nao-iniciado' });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ⏳ → ✓ → ✗" : ""}
                            >
                              {getStatusIcon(prog.documentoSintese)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const next: Record<string, any> = { 'nao-iniciado': 'em-andamento', 'em-andamento': 'concluido', 'concluido': 'nao-iniciado' };
                                updateProgram(prog.id, { parecerTecnico: next[prog.parecerTecnico as string] || 'nao-iniciado' });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ⏳ → ✓ → ✗" : ""}
                            >
                              {getStatusIcon(prog.parecerTecnico)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const next: Record<string, any> = { 'nao-instituido': 'instituido', 'instituido': 'ativo', 'ativo': 'nao-instituido' };
                                updateProgram(prog.id, { statusCGProg: next[prog.statusCGProg as string] || 'nao-instituido' });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ⏳ → ✓ → ✗" : ""}
                            >
                              {getStatusIcon(prog.statusCGProg)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const next: Record<string, any> = { 'nao-iniciado': 'em-andamento', 'em-andamento': 'concluido', 'concluido': 'nao-iniciado' };
                                updateProgram(prog.id, { cartaCompromissoElaborada: next[prog.cartaCompromissoElaborada as string] || 'nao-iniciado' });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ⏳ → ✓ → ✗" : ""}
                            >
                              {getStatusIcon(prog.cartaCompromissoElaborada)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => {
                                if (!isAdmin) return;
                                const next: Record<string, any> = { 'nao-iniciado': 'em-andamento', 'em-andamento': 'concluido', 'concluido': 'nao-iniciado' };
                                updateProgram(prog.id, { cartaCompromissoAnalisada: next[prog.cartaCompromissoAnalisada as string] || 'nao-iniciado' });
                              }} 
                              className={`text-lg transition-transform ${isAdmin ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                              title={isAdmin ? "Clique para alterar: ✗ → ⏳ → ✓ → ✗" : ""}
                            >
                              {getStatusIcon(prog.cartaCompromissoAnalisada)}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${calculateProgress(prog)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-600">{calculateProgress(prog)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => startEdit(prog)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <Card key={prog.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all group">
              <CardContent className="p-0">
                <div className={`h-2 ${prog.tipo === 'top-down' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-emerald-600 transition-colors">{prog.nome}</h3>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => startEdit(prog)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Coordenador:</span>
                      <span className="font-bold text-slate-700">{prog.coordenador || 'A designar'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">PF SGPG:</span>
                      <span className="font-bold text-slate-700">{prog.pontoFocalSGPG || 'A designar'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">GT</div>
                      <div className="text-lg">{getStatusIcon(prog.statusGT)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">SÍNTESE</div>
                      <div className="text-lg">{getStatusIcon(prog.documentoSintese)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">PARECER</div>
                      <div className="text-lg">{getStatusIcon(prog.parecerTecnico)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">CGPROG</div>
                      <div className="text-lg">{getStatusIcon(prog.statusCGProg)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">CARTA ELAB.</div>
                      <div className="text-lg">{getStatusIcon(prog.cartaCompromissoElaborada)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1">CARTA ANALIS.</div>
                      <div className="text-lg">{getStatusIcon(prog.cartaCompromissoAnalisada)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Progresso Geral</span>
                      <span className="text-lg font-black text-emerald-600 leading-none">{calculateProgress(prog)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${calculateProgress(prog)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
