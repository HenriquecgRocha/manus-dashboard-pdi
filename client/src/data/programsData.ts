// Dados centralizados dos programas - Fonte única de verdade
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
}

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

export const checklistTemplates: string[] = [
  "Estudo GT prévio",
  "Estudo da programação de PD&I",
  "Alinhamento com coordenador do GT",
  "Alinhamento com GT",
  "Indicação de projetos (GT)",
  "Indicação de ativos (GT)",
  "Consulta à GIPDI/SIPDI sobre dados necessários dos projetos",
  "Consulta à GGPJ/SQA sobre dados necessários dos ativos",
  "Elaboração e alimentação da base de dados do programa (GT)",
  "Elaboração do Relatório do Programa (Looker Studio)",
  "Elaboração do Documento Síntese do Programa (GT)",
  "Parecer acerca do Documento Síntese (GGPP)",
  "Parecer acerca da implementação do Programa de PD&I (CPA)",
  "Nomeação do CGPROG (DEPD)"
];

export const documentoSinteseChecklist: string[] = [
  "1. Título do Programa (Claro, objetivo e breve; Palavras-chave relevantes)",
  "2. Propósito do Programa (preliminar) (Razão da existência; Missão ou motivação fundamental; Impacto se desejado; A ser reafirmado ou refinado)",
  "3. Estado da arte (técnico-científico) (Panorama atual; Avanços tecnológicos; Tendências; Gaps de pesquisa)",
  "4. Importância socioeconômica do tema (Abrangência geográfica; Produtores envolvidos; Representantes das partes interessadas; Importância do tema para o público-alvo)",
  "5. Capacidade da Embrapa no desenvolvimento do Programa (Projetos; Tecnologias; Equipes, parceiros e recursos financeiros)",
  "6. Contribuição da Embrapa para o desenvolvimento da cadeia produtiva ou do tema (Soluções de inovação; Tecnologias; Resultados)",
  "7. Aspectos regulatórios (Legislação relacionada ao tema)",
  "8. Desafios e Oportunidades (Análise SWOT/FOFA) (Pontos fortes; Pontos fracos; Ameaças; Oportunidades)",
  "9. Linhas Temáticas (Estratégias para superação de fraquezas e ameaças e aproveitamento de oportunidades)",
  "10. Propósito consolidado (Reafirmação/refinamento do propósito inicial)",
  "11. Indicação do CGProg (Coordenador; Membros)"
];

export const cgprogChecklistTemplates: string[] = [
  "Definição das Linhas Temáticas",
  "Alinhamento de Conteúdo (Projetos/LT)",
  "Indicação do Objetivo Geral",
  "Desdobramento em Metas",
  "Proposição de Ações (Eixos Analíticos)",
  "Detalhamento das Ações (Recursos/Responsáveis)",
  "Redação da Carta de Compromisso",
  "Inclusão e Assinatura no SEI",
  "Emissão de Parecer Consultivo (GGPD/GGPP)",
  "Deliberação do CPA"
];

export const createInitialChecklist = (): ChecklistItem[] => {
  return checklistTemplates.map((desc, index) => ({
    id: index + 1,
    descricao: desc,
    concluido: false,
    dataInicio: '',
    dataConclusao: ''
  }));
};

export const createInitialCGProgChecklist = (): ChecklistItem[] => {
  return cgprogChecklistTemplates.map((desc, index) => ({
    id: index + 1,
    descricao: desc,
    concluido: false,
    dataInicio: '',
    dataConclusao: ''
  }));
};

export const createInitialSinteseChecklist = (): ChecklistItem[] => {
  return documentoSinteseChecklist.map((desc, index) => ({
    id: index + 1,
    descricao: desc,
    concluido: false,
    dataInicio: '',
    dataConclusao: ''
  }));
};

export const programsData: Program[] = [];

export function getProgramById(id: string): Program | undefined {
  return programsData.find(p => p.id === id);
}

export function getTopDownPrograms(): Program[] {
  return programsData.filter(p => p.tipo === 'top-down');
}

export function getBottomUpPrograms(): Program[] {
  return programsData.filter(p => p.tipo === 'bottom-up');
}
