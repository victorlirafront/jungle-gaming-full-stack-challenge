export interface TaskCreatedEvent {
  taskId: string;
  title: string;
  creatorId: string;
  assignedUserIds?: string[];
}

export interface TaskUpdatedEvent {
  taskId: string;
  title: string;
  changes: string[];
  userId: string;
  assignedUserIds?: string[];
  creatorId: string;
  newlyAssignedUserIds?: string[];
}

export interface TaskStatusChangedEvent {
  taskId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  userId: string;
  assignedUserIds?: string[];
  creatorId: string;
}

export interface TaskCommentedEvent {
  taskId: string;
  commentId: string;
  authorId: string;
  assignedUserIds?: string[];
  creatorId: string;
}

export interface TaskDeletedEvent {
  taskId: string;
  title: string;
  userId: string;
}

