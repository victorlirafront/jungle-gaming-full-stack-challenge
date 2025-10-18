import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilter';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';
import { TaskFormData } from '@/validations';
import { TaskStatus, TaskPriority } from '@repo/types';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import type { Task } from '@/types/task.types';

export function TaskList() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
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
      });
      setCurrentPage(1);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Erro ao criar tarefa. Tente novamente.');
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
        },
      });
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Erro ao atualizar tarefa. Tente novamente.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Erro ao deletar tarefa. Tente novamente.');
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
      setShowForm(false);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as TaskStatus | '');
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value as TaskPriority | '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e colabore com sua equipe
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Tarefa'}
        </Button>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          initialData={{
            title: editingTask.title,
            description: editingTask.description || '',
            priority: editingTask.priority,
            status: editingTask.status,
            deadline: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
          }}
        />
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

