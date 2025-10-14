import { TaskPriority, TaskStatus } from '@repo/types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TaskFiltersProps } from './index.types';

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input
        type="search"
        placeholder="Buscar tarefas..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-1/3"
      />

      <Select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">Todos os status</option>
        <option value={TaskStatus.TODO}>To Do</option>
        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
        <option value={TaskStatus.REVIEW}>Review</option>
        <option value={TaskStatus.DONE}>Done</option>
      </Select>

      <Select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
      >
        <option value="">Todas as prioridades</option>
        <option value={TaskPriority.LOW}>Low</option>
        <option value={TaskPriority.MEDIUM}>Medium</option>
        <option value={TaskPriority.HIGH}>High</option>
        <option value={TaskPriority.URGENT}>Urgent</option>
      </Select>
    </div>
  );
}

