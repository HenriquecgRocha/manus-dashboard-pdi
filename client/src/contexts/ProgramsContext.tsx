import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  onProgramsUpdate, 
  updateProgram as firebaseUpdateProgram, 
  addHistoryEntry as firebaseAddHistoryEntry,
  onHistoryUpdate
} from '@/lib/firebase';
import { 
  createInitialChecklist, 
  createInitialCGProgChecklist, 
  createInitialSinteseChecklist 
} from '@/data/programsData';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface ChecklistItem {
  id: number;
  descricao: string;
  concluido: boolean;
  dataInicio?: string;
  dataConclusao?: string;
  prazoDias?: number;
}

export interface CGProgActivity {
  id: string;
  nome: string;
  descricao: string;
  status: 'pendente' | 'em-andamento' | 'concluida';
  percentual: number;
}

export interface Program {
  id: string;
  nome: string;
  tipo: 'top-down' | 'bottom-up';
  coordenador: string;
  pontoFocalSGPG: string;
  membrosGT: number;
  dataGT: string;
  dataCGProg: string;
  statusGT: 'nao-nomeado' | 'em-atividade' | 'concluido';
  statusCGProg: 'nao-instituido' | 'instituido' | 'ativo';
  documentoSintese: 'nao-iniciado' | 'em-andamento' | 'concluido';
  parecerTecnico: 'nao-iniciado' | 'em-andamento' | 'concluido';
  cartaCompromissoElaborada: 'nao-iniciado' | 'em-andamento' | 'concluido';
  cartaCompromissoAnalisada: 'nao-iniciado' | 'em-andamento' | 'concluido';
  validacaoCPA: boolean;
  percentualConclusao: number;
  percentualCGProg: number;
  cgprogAtividades: CGProgActivity[];
  checklist: ChecklistItem[];
  checklistCGProg: ChecklistItem[];
  checklistSintese: ChecklistItem[];
  dataUltimaAtualizacao?: string;
}

export interface EditHistory {
  id: string;
  usuario: string;
  programId: string;
  programName: string;
  campo: string;
  valorAnterior: any;
  valorNovo: any;
  dataHora: string;
}

interface ProgramsContextType {
  programs: Program[];
  auditHistory: EditHistory[];
  loading: boolean;
  isOnline: boolean;
  userRole: 'admin' | 'viewer';
  updateProgram: (id: string, updates: Partial<Program>) => Promise<void>;
  addProgram: (program: Partial<Program>) => Promise<void>;
  getAuditHistory: () => EditHistory[];
  syncData: () => void;
  clearLocalCache: () => void;
}

const ProgramsContext = createContext<ProgramsContextType | undefined>(undefined);

export function ProgramsProvider({ children }: { children: React.ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [auditHistory, setAuditHistory] = useState<EditHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('viewer');

  useEffect(() => {
    const savedUser = localStorage.getItem('temp_user_v4');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserRole(user.role || 'viewer');
    }
  }, []);
  const programsRef = useRef<Program[]>([]);

  useEffect(() => {
    const unsubscribePrograms = onProgramsUpdate((data) => {
      const programsList = Object.entries(data || {}).map(([id, value]: [string, any]) => ({
        id,
        ...value
      })) as Program[];
      setPrograms(programsList);
      programsRef.current = programsList;
      setLoading(false);
    });

    const unsubscribeHistory = onHistoryUpdate((data) => {
      const historyList = Object.entries(data || {}).map(([id, value]: [string, any]) => ({
        id,
        ...value
      })) as EditHistory[];
      
      const sortedHistory = historyList.sort((a, b) => 
        new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      );
      
      setAuditHistory(sortedHistory);
    });

    return () => {
      unsubscribePrograms();
      unsubscribeHistory();
    };
  }, []);

  const addEditHistory = useCallback(async (entry: Omit<EditHistory, 'id'>) => {
    const newEntry: EditHistory = {
      ...entry,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    try {
      await firebaseAddHistoryEntry(newEntry);
    } catch (error) {
      console.error("Erro ao adicionar histórico no Firebase:", error);
    }
  }, []);

  const updateProgram = useCallback(async (id: string, updates: any) => {
    const tempUser = JSON.parse(localStorage.getItem('temp_user_v4') || localStorage.getItem('temp_user_v3') || '{"name": "Usuário"}');
    const currentPrograms = programsRef.current;
    const programIndex = currentPrograms.findIndex(p => p.id === id);
    
    if (programIndex === -1) return;

    const oldProgram = currentPrograms[programIndex];
    const historyEntries: Omit<EditHistory, 'id'>[] = [];
    
    Object.keys(updates).forEach(key => {
      if (key === 'checklist' || key === 'checklistCGProg' || key === 'checklistSintese') {
        // Lógica de log para checklists pode ser expandida aqui se necessário
      } else if (updates[key] !== (oldProgram as any)[key]) {
        historyEntries.push({
          usuario: tempUser.name,
          programId: id,
          programName: oldProgram.nome,
          campo: key,
          valorAnterior: (oldProgram as any)[key] || "Não definido",
          valorNovo: updates[key],
          dataHora: new Date().toISOString()
        });
      }
    });

    let newProgram = { ...oldProgram, ...updates };

    if (updates.checklist || updates.checklistCGProg) {
      const checklist = updates.checklist || oldProgram.checklist || [];
      const checklistCG = updates.checklistCGProg || oldProgram.checklistCGProg || [];
      
      const totalItems = checklist.length + checklistCG.length;
      const completedItems = checklist.filter((i: any) => i.concluido).length + 
                             checklistCG.filter((i: any) => i.concluido).length;
      newProgram.percentualConclusao = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      const totalCG = checklistCG.length;
      const completedCG = checklistCG.filter((i: any) => i.concluido).length;
      newProgram.percentualCGProg = totalCG > 0 ? Math.round((completedCG / totalCG) * 100) : 0;
    }

    newProgram.dataUltimaAtualizacao = new Date().toISOString();

    try {
      await firebaseUpdateProgram(id, newProgram);
      for (const entry of historyEntries) {
        await addEditHistory(entry);
      }
      toast.success("Programa atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar programa:", error);
      toast.error("Erro ao atualizar programa.");
    }
  }, [addEditHistory]);

  const addProgram = useCallback(async (programData: Partial<Program>) => {
    try {
      const id = Date.now().toString();
      const newProgram: Program = {
        id,
        nome: programData.nome || 'Novo Programa',
        tipo: programData.tipo || 'top-down',
        coordenador: programData.coordenador || 'A designar',
        pontoFocalSGPG: programData.pontoFocalSGPG || 'A designar',
        membrosGT: 0,
        dataGT: new Date().toISOString().split('T')[0],
        dataCGProg: '',
        statusGT: 'nao-nomeado',
        statusCGProg: 'nao-instituido',
        documentoSintese: 'nao-iniciado',
        parecerTecnico: 'nao-iniciado',
        cartaCompromissoElaborada: 'nao-iniciado',
        cartaCompromissoAnalisada: 'nao-iniciado',
        validacaoCPA: false,
        percentualConclusao: 0,
        percentualCGProg: 0,
        cgprogAtividades: [],
        checklist: createInitialChecklist(),
        checklistCGProg: createInitialCGProgChecklist(),
        checklistSintese: createInitialSinteseChecklist(),
      };
      await firebaseUpdateProgram(id, newProgram);
      toast.success("Novo programa adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar programa:", error);
      toast.error("Erro ao adicionar programa.");
    }
  }, []);

  const getAuditHistory = useCallback(() => {
    return auditHistory;
  }, [auditHistory]);

  const syncData = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const clearLocalCache = useCallback(() => {
    localStorage.removeItem('programs_cache');
    syncData();
  }, [syncData]);

  return (
    <ProgramsContext.Provider value={{ 
      programs, 
      auditHistory,
      loading, 
      isOnline: true,
      userRole,
      updateProgram, 
      addProgram,
      getAuditHistory,
      syncData,
      clearLocalCache
    }}>
      {children}
    </ProgramsContext.Provider>
  );
}

export function usePrograms() {
  const context = useContext(ProgramsContext);
  if (context === undefined) {
    throw new Error('usePrograms must be used within a ProgramsProvider');
  }
  return context;
}
