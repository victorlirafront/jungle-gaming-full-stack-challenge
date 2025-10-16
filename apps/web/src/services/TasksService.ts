import { httpClient } from '@/http';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  FilterTasksRequest,
  Comment,
  CreateCommentRequest,
  TaskHistory,
} from '@/types/task.types';

export class TasksService {
  private readonly endpoint = '/tasks';

  async create(data: CreateTaskRequest): Promise<Task> {
    return httpClient.post<Task>(this.endpoint, data);
  }

  async findAll(filters?: FilterTasksRequest): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.assignedUserId) queryParams.append('assignedUserId', filters.assignedUserId);
    if (filters?.creatorId) queryParams.append('creatorId', filters.creatorId);

    const query = queryParams.toString();
    return httpClient.get<Task[]>(`${this.endpoint}${query ? `?${query}` : ''}`);
  }

  async findOne(id: string): Promise<Task> {
    return httpClient.get<Task>(`${this.endpoint}/${id}`);
  }

  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    return httpClient.put<Task>(`${this.endpoint}/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  async createComment(taskId: string, data: CreateCommentRequest): Promise<Comment> {
    return httpClient.post<Comment>(`${this.endpoint}/${taskId}/comments`, data);
  }

  async getComments(taskId: string, limit?: number, offset?: number): Promise<Comment[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const query = queryParams.toString();
    return httpClient.get<Comment[]>(
      `${this.endpoint}/${taskId}/comments${query ? `?${query}` : ''}`
    );
  }

  async getHistory(taskId: string): Promise<TaskHistory[]> {
    return httpClient.get<TaskHistory[]>(`${this.endpoint}/${taskId}/history`);
  }
}

export const tasksService = new TasksService();

