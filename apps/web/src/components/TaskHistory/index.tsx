import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { TaskHistory } from '@/types/task.types';

interface TaskHistoryProps {
  history: TaskHistory[];
  isLoading?: boolean;
}

const actionColors = {
  CREATED: 'bg-green-100 text-green-800',
  UPDATED: 'bg-blue-100 text-blue-800',
  DELETED: 'bg-red-100 text-red-800',
  COMMENTED: 'bg-purple-100 text-purple-800',
};

const actionLabels = {
  CREATED: '✨ Criada',
  UPDATED: '✏️ Atualizada',
  DELETED: '🗑️ Deletada',
  COMMENTED: '💬 Comentada',
};

export function TaskHistory({ history, isLoading }: TaskHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhum histórico disponível.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 mt-1">
                <Badge className={actionColors[entry.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}>
                  {actionLabels[entry.action as keyof typeof actionLabels] || entry.action}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                {entry.details && (
                  <p className="text-sm text-gray-700 mb-1">{entry.details}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

