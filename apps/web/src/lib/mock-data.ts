import { TaskPriority, TaskStatus } from '@repo/types';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  assignedUsers: User[];
}

export interface Comment {
  id: string;
  taskId: string;
  user: User;
  content: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar autenticação JWT',
    description: 'Criar sistema de autenticação com JWT incluindo access e refresh tokens.',
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    deadline: '2025-10-20',
    createdAt: '2025-10-10T10:00:00Z',
    updatedAt: '2025-10-14T14:30:00Z',
    assignedUsers: [mockUsers[0], mockUsers[1]],
  },
  {
    id: '2',
    title: 'Configurar RabbitMQ',
    description: 'Setup do message broker para comunicação entre microserviços.',
    priority: TaskPriority.URGENT,
    status: TaskStatus.TODO,
    deadline: '2025-10-18',
    createdAt: '2025-10-12T09:00:00Z',
    updatedAt: '2025-10-12T09:00:00Z',
    assignedUsers: [mockUsers[2]],
  },
  {
    id: '3',
    title: 'Criar componentes do frontend',
    description: 'Desenvolver componentes React com shadcn/ui e Tailwind CSS.',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.REVIEW,
    deadline: '2025-10-25',
    createdAt: '2025-10-08T15:00:00Z',
    updatedAt: '2025-10-13T11:00:00Z',
    assignedUsers: [mockUsers[0]],
  },
  {
    id: '4',
    title: 'Documentação da API',
    description: 'Criar documentação completa com Swagger/OpenAPI.',
    priority: TaskPriority.LOW,
    status: TaskStatus.DONE,
    deadline: '2025-10-15',
    createdAt: '2025-10-05T08:00:00Z',
    updatedAt: '2025-10-14T16:00:00Z',
    assignedUsers: [mockUsers[1], mockUsers[2]],
  },
  {
    id: '5',
    title: 'Implementar WebSocket',
    description: 'Configurar WebSocket para notificações em tempo real.',
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    deadline: '2025-10-22',
    createdAt: '2025-10-13T12:00:00Z',
    updatedAt: '2025-10-13T12:00:00Z',
    assignedUsers: [mockUsers[0], mockUsers[2]],
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    taskId: '1',
    user: mockUsers[0],
    content: 'Já comecei a implementação do login endpoint.',
    createdAt: '2025-10-14T10:00:00Z',
  },
  {
    id: '2',
    taskId: '1',
    user: mockUsers[1],
    content: 'Excelente! Vou trabalhar no refresh token.',
    createdAt: '2025-10-14T11:30:00Z',
  },
  {
    id: '3',
    taskId: '1',
    user: mockUsers[0],
    content: 'Terminei o login, fazendo testes agora.',
    createdAt: '2025-10-14T14:00:00Z',
  },
  {
    id: '4',
    taskId: '3',
    user: mockUsers[0],
    content: 'Header e Footer prontos, vou criar os componentes de task agora.',
    createdAt: '2025-10-13T11:00:00Z',
  },
];

