import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Search, Download, Filter, History, User, FileText, Clock, FileJson, Table } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useExport } from '@/hooks/useExport';
import { Program } from '@/contexts/ProgramsContext';

export default function AuditLog() {
  const { getAuditHistory, programs } = usePrograms();
  const { exportHistoryToCSV, exportHistoryToJSON, exportToCSV, exportChecklistToCSV, exportToJSON } = useExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');

  const auditHistory = getAuditHistory();

  const filteredHistory = auditHistory.filter(entry => {
    const matchesSearch = 
      (entry.programName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (entry.campo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (entry.usuario?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesProgram = !filterProgram || entry.programId === filterProgram;

    return matchesSearch && matchesProgram;
  });

  const handleExportHistoryCSV = () => {
    exportHistoryToCSV(getAuditHistory(), `auditoria_${new Date().toISOString().substring(0, 10)}.csv`);
  };

  const handleExportHistoryJSON = () => {
    exportHistoryToJSON(getAuditHistory(), `auditoria_${new Date().toISOString().substring(0, 10)}.json`);
  };

  const handleExportProgramasCSV = () => {
    exportToCSV(programs, `programas_${new Date().toISOString().substring(0, 10)}.csv`);
  };

  const handleExportProgramasJSON = () => {
    exportToJSON(programs, `programas_${new Date().toISOString().substring(0, 10)}.json`);
  };

  const handleExportChecklistsCSV = () => {
    exportChecklistToCSV(programs, `checklists_${new Date().toISOString().substring(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Auditoria</h1>
          <p className="text-slate-500 mt-1">Acompanhe todas as alterações feitas no painel por todos os usuários.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 items-center">
            <span className="text-xs text-slate-500 font-medium">Histórico:</span>
            <Button
              onClick={handleExportHistoryCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600"
            >
              <Table className="w-4 h-4" />
              CSV
            </Button>
            <Button
              onClick={handleExportHistoryJSON}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </Button>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-xs text-slate-500 font-medium">Programas:</span>
            <Button
              onClick={handleExportProgramasCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600"
            >
              <Table className="w-4 h-4" />
              CSV
            </Button>
            <Button
              onClick={handleExportProgramasJSON}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </Button>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-xs text-slate-500 font-medium">Checklists:</span>
            <Button
              onClick={handleExportChecklistsCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 text-slate-600"
            >
              <Table className="w-4 h-4" />
              CSV
            </Button>
          </div>
          <Badge variant="outline" className="px-3 py-1 border-slate-200 text-slate-600 bg-slate-50">
            <History className="w-4 h-4 mr-2" />
            {filteredHistory.length} registros
          </Badge>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-sm font-medium flex items-center text-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por usuário, campo ou programa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Programas</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.id}>
                  {prog.nome}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-semibold flex items-center text-slate-800">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Linha do Tempo de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/30 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-700 text-sm">Data/Hora</th>
                  <th className="p-4 font-bold text-slate-700 text-sm">Usuário</th>
                  <th className="p-4 font-bold text-slate-700 text-sm">Programa</th>
                  <th className="p-4 font-bold text-slate-700 text-sm">Campo</th>
                  <th className="p-4 font-bold text-slate-700 text-sm">Alteração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 italic">
                      Nenhuma alteração registrada ainda.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                        {format(new Date(entry.dataHora), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{entry.usuario}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-slate-700 text-sm">
                          <FileText className="w-4 h-4 mr-2 text-slate-400" />
                          {entry.programName}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none text-xs">
                          {entry.campo}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-xs">
                          <span className="text-slate-400 line-through mb-1">De: {String(entry.valorAnterior)}</span>
                          <span className="text-green-600 font-semibold">Para: {String(entry.valorNovo)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
