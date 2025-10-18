import { IsString, IsOptional, IsEnum, IsDateString, IsArray, MaxLength } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

