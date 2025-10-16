import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { tasksService } from '@/services';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilter';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';
import { TaskPriority, TaskStatus } from '@repo/types';
import type { Task } from '@/types/task.types';


export function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksService.findAll();
      console.log('✅ Tasks carregadas da API:', data);
      setTasks(data);
    } catch (error) {
      console.error('❌ Erro ao carregar tasks:', error);
      // Se falhar (ex: não autenticado), mostra lista vazia
      setTasks([]);
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

  const handleCreateTask = async (newTask: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: string;
  }) => {
    try {
      await tasksService.create({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.deadline,
      });
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
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
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

      <div className="text-sm text-muted-foreground text-center">
        Mostrando {filteredTasks.length} de {tasks.length} tarefa(s)
      </div>
    </div>
  );
}

