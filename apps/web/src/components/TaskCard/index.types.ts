import { Task } from "@/lib/mock-data";

export interface TaskCardProps {
  task: Task;
  onView: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}
