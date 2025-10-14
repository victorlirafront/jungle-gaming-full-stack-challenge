import { useState } from 'react';
import { TaskPriority, TaskStatus } from '@repo/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TaskFormProps } from './index.types';


export function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(
    initialData?.priority || TaskPriority.MEDIUM
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialData?.status || TaskStatus.TODO
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority,
      status,
      deadline,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.DONE}>Done</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Prazo</label>
              <Input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

