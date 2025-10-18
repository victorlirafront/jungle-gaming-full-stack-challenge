import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '@/services';
import type { 
  FilterTasksRequest, 
  CreateTaskRequest, 
  UpdateTaskRequest 
} from '@/types/task.types';

export const TASKS_QUERY_KEY = 'tasks';
export const COMMENTS_QUERY_KEY = 'comments';
export const HISTORY_QUERY_KEY = 'task-history';

export function useTasks(filters?: FilterTasksRequest) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: () => tasksService.findAll(filters),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, taskId],
    queryFn: () => tasksService.findOne(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.remove(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

export function useTaskComments(taskId: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: [COMMENTS_QUERY_KEY, taskId, limit, offset],
    queryFn: () => tasksService.getComments(taskId, limit, offset),
    enabled: !!taskId,
    select: (data) => data || { data: [], total: 0 },
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string }) => tasksService.createComment(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, taskId] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, taskId] });
    },
  });
}

export function useTaskHistory(taskId: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: [HISTORY_QUERY_KEY, taskId, limit, offset],
    queryFn: () => tasksService.getHistory(taskId, limit, offset),
    enabled: !!taskId,
  });
}

