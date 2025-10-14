import { useState } from 'react';
import { mockTasks, mockComments, mockUsers } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CommentList } from '@/components/CommentList';
import { TaskPriority, TaskStatus } from '@repo/types';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

const priorityColors = {
  [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 border-blue-300',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800 border-red-300',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.REVIEW]: 'bg-purple-100 text-purple-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
};

export function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const task = mockTasks.find((t) => t.id === taskId);
  const [comments, setComments] = useState(
    mockComments.filter((c) => c.taskId === taskId)
  );

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tarefa não encontrada</p>
        <Button onClick={onBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const handleAddComment = (content: string) => {
    const newComment = {
      id: String(Date.now()),
      taskId: task.id,
      user: mockUsers[0],
      content,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Voltar
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{task.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                <Badge className={statusColors[task.status]}>{task.status}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Prazo</h3>
              <p className="text-sm">
                📅 {new Date(task.deadline).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Atribuído a</h3>
              <div className="flex gap-1 flex-wrap">
                {task.assignedUsers.map((user) => (
                  <Badge key={user.id} variant="outline">
                    {user.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {new Date(task.createdAt).toLocaleString('pt-BR')}
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span>{' '}
              {new Date(task.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      <CommentList comments={comments} onAddComment={handleAddComment} />
    </div>
  );
}

