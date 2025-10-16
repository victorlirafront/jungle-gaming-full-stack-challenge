import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';

export class FilterTasksDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'uuid-123' })
  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: 'uuid-456' })
  @IsString()
  @IsOptional()
  creatorId?: string;
}

