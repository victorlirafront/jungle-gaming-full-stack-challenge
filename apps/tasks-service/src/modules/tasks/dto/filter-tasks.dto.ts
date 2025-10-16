import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';

export class FilterTasksDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  creatorId?: string;
}

