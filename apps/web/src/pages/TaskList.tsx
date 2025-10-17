import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { tasksService } from '@/services';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilter';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';
import { TaskFormData } from '@/validations';
import { TaskStatus, TaskPriority } from '@repo/types';
import type { Task } from '@/types/task.types';


export function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [currentPage]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await tasksService.findAll({
        status: statusFilter ? (statusFilter as TaskStatus) : undefined,
        priority: priorityFilter ? (priorityFilter as TaskPriority) : undefined,
        limit: itemsPerPage,
        offset,
      });
      setTasks(response.data);
      setTotalTasks(response.total);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
      setTotalTasks(0);
    } finally {
      setLoading(false);
    }
  };

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
      await tasksService.create({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.deadline,
      });
      setCurrentPage(1);
      await loadTasks();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Erro ao criar tarefa. Tente novamente.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await tasksService.remove(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Erro ao deletar tarefa. Tente novamente.');
      }
    }
  };

  const handleViewTask = (taskId: string) => {
    navigate({ to: '/tasks/$taskId', params: { taskId } });
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

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityFilterChange}
      />

      {loading ? (
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
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      )}

      {!loading && totalTasks > 0 && (
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

