import { Task } from "@/types/task.types";

export interface TaskCardProps {
  task: Task;
  onView: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}
