import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Activity {
  nome: string;
  status: 'concluida' | 'em-andamento' | 'pendente';
  dataUltima?: string;
  proximaData?: string;
  descricao?: string;
}

interface ProgramActivitiesProps {
  programId: string;
  programNome: string;
  dataDocumentoSintese?: string | null;
  activities: Activity[];
}

export default function ProgramActivities({
  programId,
  programNome,
  dataDocumentoSintese,
  activities,
}: ProgramActivitiesProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'em-andamento':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pendente':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      concluida: 'bg-green-50 text-green-700 border-green-200',
      'em-andamento': 'bg-blue-50 text-blue-700 border-blue-200',
      pendente: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      concluida: 'Concluída',
      'em-andamento': 'Em Andamento',
      pendente: 'Pendente',
    };
    return labels[status] || status;
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Atividades do Programa</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{programNome}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getStatusColor(activity.status)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.nome}</p>
                  {activity.descricao && (
                    <p className="text-xs opacity-75 mt-1">{activity.descricao}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs opacity-75">
                    {activity.dataUltima && (
                      <span>Última: {activity.dataUltima}</span>
                    )}
                    {activity.proximaData && (
                      <span>Próxima: {activity.proximaData}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {getStatusLabel(activity.status)}
              </Badge>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> O monitoramento é um processo contínuo. A atualização da base de dados ocorre 6 meses após a última versão da planilha Síntese.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
