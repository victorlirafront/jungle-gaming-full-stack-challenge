import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMMENTED = 'TASK_COMMENTED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
}

@Entity('notifications')
@Index(['userId'])
@Index(['userId', 'read'])
@Index(['userId', 'createdAt'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ length: 255 })
  title!: string;

  @Column('text')
  message!: string;

  @Column('jsonb', { nullable: true })
  data!: Record<string, unknown>;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

