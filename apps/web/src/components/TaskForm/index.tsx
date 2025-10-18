import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskPriority, TaskStatus } from '@repo/types';
import { taskSchema, type TaskFormData } from '@/validations';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TaskFormProps } from './index.types';
import { authService } from '@/services';

export function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [users, setUsers] = useState<Array<{ id: string; username: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      deadline: '',
      assignedUserIds: [],
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await authService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              {...register('title')}
              placeholder="Digite o título da tarefa"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              {...register('description')}
              placeholder="Descreva a tarefa..."
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <Select {...register('priority')}>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </Select>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select {...register('status')}>
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.DONE}>Done</option>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Prazo</label>
              <Input type="date" {...register('deadline')} />
              {errors.deadline && (
                <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Atribuir a</label>
            {loadingUsers ? (
              <p className="text-sm text-gray-500">Carregando usuários...</p>
            ) : (
              <Controller
                name="assignedUserIds"
                control={control}
                render={({ field }) => (
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum usuário disponível</p>
                    ) : (
                      users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={user.id}
                            checked={field.value?.includes(user.id) || false}
                            onChange={(e) => {
                              const currentValue = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValue, user.id]);
                              } else {
                                field.onChange(
                                  currentValue.filter((id) => id !== user.id)
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              />
            )}
            {errors.assignedUserIds && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedUserIds.message}</p>
            )}
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
  );
}
