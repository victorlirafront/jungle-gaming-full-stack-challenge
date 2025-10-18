import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CommentList } from '@/components/CommentList';
import { TaskForm } from '@/components/TaskForm';
import { TaskFormData } from '@/validations';
import { TaskPriority, TaskStatus } from '@repo/types';
import { useTask, useTaskComments, useCreateComment, useUpdateTask } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/auth.store';

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
  const { data: task, isLoading } = useTask(taskId);
  const { data: comments = [] } = useTaskComments(taskId);
  const createCommentMutation = useCreateComment(taskId);
  const updateTaskMutation = useUpdateTask();
  const user = useAuthStore((state) => state.user);
  const [addingComment, setAddingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isCreator = user?.id === task?.creatorId;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando tarefa...</p>
      </div>
    );
  }

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

  const handleAddComment = async (content: string) => {
    if (addingComment) {
      return;
    }

    try {
      setAddingComment(true);
      await createCommentMutation.mutateAsync({ content });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setAddingComment(false);
    }
  };

  const handleUpdateTask = async (updatedTask: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          dueDate: updatedTask.deadline,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Erro ao atualizar tarefa. Tente novamente.');
    }
  };

  if (isEditing && task) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          ← Cancelar Edição
        </Button>

        <TaskForm
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditing(false)}
          initialData={{
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            deadline: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Voltar
        </Button>
        {isCreator && (
          <Button onClick={() => setIsEditing(true)}>
            ✏️ Editar Tarefa
          </Button>
        )}
      </div>

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
            {task.dueDate && (
              <div>
                <h3 className="font-semibold mb-2">Prazo</h3>
                <p className="text-sm">
                  📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {task.assignments && task.assignments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Atribuído a</h3>
                <div className="flex gap-1 flex-wrap">
                  {task.assignments.map((assignment) => (
                    <Badge key={assignment.id} variant="outline">
                      User {assignment.userId.slice(0, 8)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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

