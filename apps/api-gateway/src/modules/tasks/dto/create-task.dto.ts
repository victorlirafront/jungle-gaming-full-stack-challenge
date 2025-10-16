import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, MaxLength } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement authentication', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Add JWT authentication to the API' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

