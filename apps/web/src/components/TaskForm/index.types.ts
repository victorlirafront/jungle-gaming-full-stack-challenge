import { TaskPriority, TaskStatus } from '@repo/types';


export interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: string;
  };
}
