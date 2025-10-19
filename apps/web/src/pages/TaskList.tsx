import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilter';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskModal } from '@/components/TaskModal';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';
import { TaskFormData } from '@/validations';
import { TaskStatus, TaskPriority } from '@repo/types';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useToastStore } from '@/store/toast.store';
import type { Task } from '@/types/task.types';

export function TaskList() {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter]);

  const offset = (currentPage - 1) * itemsPerPage;
  const { data: tasksData, isLoading } = useTasks({
    status: statusFilter ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter ? (priorityFilter as TaskPriority) : undefined,
    limit: itemsPerPage,
    offset,
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.total || 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description?.toLowerCase() || '').includes(search.toLowerCase());

      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const handleCreateTask = async (newTask: TaskFormData) => {
    try {
      await createTaskMutation.mutateAsync({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.deadline,
        assignedUserIds: newTask.assignedUserIds,
      });
      setCurrentPage(1);
      addToast({
        type: 'success',
        title: 'Tarefa criada com sucesso!',
        message: `"${newTask.title}" foi adicionada.`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      addToast({
        type: 'error',
        title: 'Erro ao criar tarefa',
        message: 'Tente novamente.',
      });
    }
  };

  const handleUpdateTask = async (updatedTask: TaskFormData) => {
    if (!editingTask) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: {
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          dueDate: updatedTask.deadline,
          assignedUserIds: updatedTask.assignedUserIds,
        },
      });
      setEditingTask(null);
      addToast({
        type: 'success',
        title: 'Tarefa atualizada!',
        message: `"${updatedTask.title}" foi atualizada.`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar tarefa',
        message: 'Tente novamente.',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        addToast({
          type: 'success',
          title: 'Tarefa deletada!',
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        addToast({
          type: 'error',
          title: 'Erro ao deletar tarefa',
          message: 'Tente novamente.',
        });
      }
    }
  };

  const handleViewTask = (taskId: string) => {
    navigate({ to: '/tasks/$taskId', params: { taskId } });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as TaskStatus | '');
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value as TaskPriority | '');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e colabore com sua equipe
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Nova Tarefa
        </Button>
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
      />

      {editingTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Editar Tarefa"
        >
          <TaskForm
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            initialData={{
              title: editingTask.title,
              description: editingTask.description || '',
              priority: editingTask.priority,
              status: editingTask.status,
              deadline: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
              assignedUserIds: editingTask.assignments?.map(a => a.userId) || [],
            }}
          />
        </TaskModal>
      )}

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityFilterChange}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {search || statusFilter || priorityFilter
                  ? 'Nenhuma tarefa encontrada com os filtros aplicados.'
                  : 'Nenhuma tarefa ainda. Crie sua primeira tarefa!'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      )}

      {!isLoading && totalTasks > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredTasks.length} de {totalTasks} tarefa(s)
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {Math.ceil(totalTasks / itemsPerPage)}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= Math.ceil(totalTasks / itemsPerPage)}
            >
              Próxima →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

