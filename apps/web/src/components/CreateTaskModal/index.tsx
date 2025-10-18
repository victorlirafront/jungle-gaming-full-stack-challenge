import { TaskModal } from '../TaskModal';
import { TaskForm } from '../TaskForm';
import { TaskFormData } from '@/validations';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <TaskModal isOpen={isOpen} onClose={onClose} title="Nova Tarefa">
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </TaskModal>
  );
}

