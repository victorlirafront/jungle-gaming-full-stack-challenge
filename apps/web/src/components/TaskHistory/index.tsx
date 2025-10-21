import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { TaskHistory } from '@/types/task.types';
import { useUsers } from '@/hooks/useUsers';
import { useTaskHistory } from '@/hooks/useTasks';
import { APP_CONSTANTS } from '@/constants/app.constants';

interface TaskHistoryProps {
  taskId: string;
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

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const { data: allUsers = [] } = useUsers();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = APP_CONSTANTS.PAGINATION.TASK_HISTORY_ITEMS_PER_PAGE;

  const offset = (currentPage - 1) * itemsPerPage;
  const { data: historyData, isLoading } = useTaskHistory(taskId, itemsPerPage, offset);

  const history = historyData?.data || [];
  const total = historyData?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const getUserById = (userId: string) => {
    return allUsers.find(u => u.id === userId);
  };

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

  if (!isLoading && total === 0) {
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
          {history.map((entry) => {
            const user = getUserById(entry.userId);
            const userName = user?.username || 'Usuário';

            return (
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
                    por <span className="font-medium">{userName}</span> em{' '}
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
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">
              Mostrando {offset + 1}-{Math.min(offset + itemsPerPage, total)} de {total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ←
              </Button>
              <span className="text-xs text-gray-500">
                {currentPage}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

