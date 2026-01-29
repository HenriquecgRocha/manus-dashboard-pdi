import { Program, ChecklistItem } from '@/contexts/ProgramsContext';
import { createInitialSinteseChecklist } from '@/data/programsData';
import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Sanitiza um valor de data para garantir que é uma string válida em formato ISO
 */
export const sanitizeDate = (date: any): string => {
  if (!date) return '';
  if (typeof date !== 'string') return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) return '';
  return date;
};

/**
 * Sanitiza um item de checklist para garantir que todos os campos são válidos
 */
export const sanitizeChecklistItem = (item: any): ChecklistItem => {
  if (!item) {
    return {
      id: 0,
      descricao: 'Item inválido',
      concluido: false,
      dataInicio: '',
      dataConclusao: '',
      prazoDias: 0
    };
  }

  const dataInicio = sanitizeDate(item.dataInicio);
  const dataConclusao = sanitizeDate(item.dataConclusao);

  let prazoDias = 0;
  if (dataInicio && dataConclusao) {
    try {
      const dInicio = parseISO(dataInicio);
      const dFim = parseISO(dataConclusao);
      if (isValid(dInicio) && isValid(dFim)) {
        prazoDias = Math.max(0, differenceInDays(dFim, dInicio));
      }
    } catch (e) {
      prazoDias = 0;
    }
  }

  return {
    id: Number(item.id) || 0,
    descricao: String(item.descricao || '').substring(0, 500),
    concluido: Boolean(item.concluido),
    dataInicio,
    dataConclusao,
    prazoDias
  };
};

/**
 * Sanitiza um programa completo para garantir que todos os campos são válidos
 */
export const sanitizeProgram = (program: any): Program => {
  if (!program) {
    throw new Error('Programa inválido');
  }

  return {
    id: String(program.id || ''),
    nome: String(program.nome || 'Programa sem nome').substring(0, 500),
    tipo: (program.tipo === 'top-down' || program.tipo === 'bottom-up') ? program.tipo : 'top-down',
    coordenador: String(program.coordenador || '').substring(0, 200),
    pontoFocalSGPG: String(program.pontoFocalSGPG || '').substring(0, 200),
    membrosGT: Number(program.membrosGT) || 0,
    dataGT: sanitizeDate(program.dataGT),
    dataCGProg: sanitizeDate(program.dataCGProg),
    statusGT: ['nao-nomeado', 'em-atividade', 'concluido'].includes(program.statusGT) 
      ? program.statusGT 
      : 'nao-nomeado',
    statusCGProg: ['nao-instituido', 'instituido', 'ativo'].includes(program.statusCGProg)
      ? program.statusCGProg
      : 'nao-instituido',
    documentoSintese: ['nao-iniciado', 'em-andamento', 'concluido'].includes(program.documentoSintese)
      ? program.documentoSintese
      : 'nao-iniciado',
    parecerTecnico: ['nao-iniciado', 'em-andamento', 'concluido'].includes(program.parecerTecnico)
      ? program.parecerTecnico
      : 'nao-iniciado',
    cartaCompromissoElaborada: ['nao-iniciado', 'em-andamento', 'concluido'].includes(program.cartaCompromissoElaborada)
      ? program.cartaCompromissoElaborada
      : 'nao-iniciado',
    cartaCompromissoAnalisada: ['nao-iniciado', 'em-andamento', 'concluido'].includes(program.cartaCompromissoAnalisada)
      ? program.cartaCompromissoAnalisada
      : 'nao-iniciado',
    validacaoCPA: Boolean(program.validacaoCPA),
    percentualConclusao: Math.min(100, Math.max(0, Number(program.percentualConclusao) || 0)),
    percentualCGProg: Math.min(100, Math.max(0, Number(program.percentualCGProg) || 0)),
    cgprogAtividades: Array.isArray(program.cgprogAtividades) ? program.cgprogAtividades : [],
    checklist: Array.isArray(program.checklist) 
      ? program.checklist.map(sanitizeChecklistItem)
      : [],
    checklistCGProg: Array.isArray(program.checklistCGProg)
      ? program.checklistCGProg.map(sanitizeChecklistItem)
      : [],
    checklistSintese: Array.isArray(program.checklistSintese)
      ? program.checklistSintese.map(sanitizeChecklistItem)
      : createInitialSinteseChecklist()
  };
};

/**
 * Sanitiza um array de programas
 */
export const sanitizeProgramsArray = (programs: any[]): Program[] => {
  if (!Array.isArray(programs)) return [];
  return programs
    .filter(p => p && typeof p === 'object')
    .map(p => {
      try {
        return sanitizeProgram(p);
      } catch (e) {
        console.error('Erro ao sanitizar programa:', e);
        return null;
      }
    })
    .filter((p): p is Program => p !== null);
};
