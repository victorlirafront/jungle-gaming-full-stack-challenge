import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

