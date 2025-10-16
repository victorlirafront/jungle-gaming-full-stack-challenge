import { TaskFormData } from '@/validations';

export interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
  initialData?: TaskFormData;
}
