import { Program } from '@/contexts/ProgramsContext';
import { EditHistory } from '@/contexts/ProgramsContext';

export function useExport() {
  const exportToJSON = (programs: Program[], filename: string = 'programas.json') => {
    const dataStr = JSON.stringify(programs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, filename);
  };

  const exportHistoryToJSON = (history: EditHistory[], filename: string = 'historico.json') => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, filename);
  };

  const exportToCSV = (programs: Program[], filename: string = 'programas.csv') => {
    const headers = [
      'ID',
      'Nome',
      'Tipo',
      'Coordenador',
      'Membros GT',
      'Data GT',
      'Data CGProg',
      'Status GT',
      'Status CGProg',
      'Documento Síntese',
      'Parecer Técnico',
      'Validação CPA',
      'Percentual Conclusão',
      'Percentual CGProg'
    ];

    const rows = programs.map(p => [
      p.id,
      `"${p.nome}"`,
      p.tipo,
      `"${p.coordenador}"`,
      p.membrosGT,
      p.dataGT,
      p.dataCGProg,
      p.statusGT,
      p.statusCGProg,
      p.documentoSintese ? 'Sim' : 'Não',
      p.parecerTecnico ? 'Sim' : 'Não',
      p.validacaoCPA ? 'Sim' : 'Não',
      p.percentualConclusao,
      p.percentualCGProg
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(dataBlob, filename);
  };

  const exportChecklistToCSV = (programs: Program[], filename: string = 'checklists.csv') => {
    const headers = [
      'ID Programa',
      'Nome Programa',
      'Item ID',
      'Descrição',
      'Concluído',
      'Data Início',
      'Data Conclusão',
      'Prazo (dias)',
      'Tipo'
    ];

    const rows: string[][] = [];

    programs.forEach(p => {
      // Adicionar itens do checklist GT
      p.checklist.forEach(item => {
        rows.push([
          p.id,
          `"${p.nome}"`,
          String(item.id),
          `"${item.descricao}"`,
          item.concluido ? 'Sim' : 'Não',
          item.dataInicio || '',
          item.dataConclusao || '',
          String(item.prazoDias || 0),
          'GT'
        ]);
      });

      // Adicionar itens do checklist CGProg
      p.checklistCGProg.forEach(item => {
        rows.push([
          p.id,
          `"${p.nome}"`,
          String(item.id),
          `"${item.descricao}"`,
          item.concluido ? 'Sim' : 'Não',
          item.dataInicio || '',
          item.dataConclusao || '',
          String(item.prazoDias || 0),
          'CGProg'
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(dataBlob, filename);
  };

  const exportHistoryToCSV = (history: EditHistory[], filename: string = 'historico.csv') => {
    const headers = [
      'ID',
      'ID Programa',
      'Nome Programa',
      'Campo',
      'Valor Anterior',
      'Valor Novo',
      'Usuário',
      'Data/Hora'
    ];

    const rows = history.map(h => [
      h.id,
      h.programId,
      `"${h.programName}"`,
      h.campo,
      `"${h.valorAnterior}"`,
      `"${h.valorNovo}"`,
      `"${h.usuario}"`,
      h.dataHora
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(dataBlob, filename);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportToJSON,
    exportHistoryToJSON,
    exportToCSV,
    exportChecklistToCSV,
    exportHistoryToCSV
  };
}
