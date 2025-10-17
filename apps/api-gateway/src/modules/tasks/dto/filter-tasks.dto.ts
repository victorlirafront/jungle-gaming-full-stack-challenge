import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

