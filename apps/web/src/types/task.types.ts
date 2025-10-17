import type { TaskPriority, TaskStatus } from '@repo/types';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creatorId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignments?: TaskAssignment[];
  comments?: Comment[];
  commentsCount?: number;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  taskId: string;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedUserIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface FilterTasksRequest {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUserId?: string;
  creatorId?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCommentRequest {
  content: string;
}

export type { TaskPriority, TaskStatus };

