import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@repo/types';
import { APP_CONSTANTS } from '@/constants/app.constants';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .max(APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH, `Descrição deve ter no máximo ${APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} caracteres`)
    .optional(),
  priority: z.nativeEnum(TaskPriority, {
    errorMap: () => ({ message: 'Prioridade inválida' }),
  }),
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  deadline: z
    .string()
    .min(1, 'Prazo é obrigatório')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'O prazo não pode ser no passado'),
  assignedUserIds: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;


