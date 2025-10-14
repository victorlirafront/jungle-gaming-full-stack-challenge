import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskPriority, TaskStatus } from '@repo/types';
import { TaskCardProps } from './index.types';


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

export function TaskCard({ task, onView, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="mt-1">{task.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge className={statusColors[task.status]}>{task.status}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>📅 Prazo:</span>
            <span>{new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
          </div>

          {task.assignedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">👥 Atribuído a:</span>
              <div className="flex gap-1">
                {task.assignedUsers.map((user) => (
                  <Badge key={user.id} variant="outline" className="text-xs">
                    {user.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onView(task.id)}>
              Ver Detalhes
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              Deletar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

