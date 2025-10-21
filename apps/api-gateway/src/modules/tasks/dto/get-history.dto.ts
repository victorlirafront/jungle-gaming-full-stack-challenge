import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { APP_CONSTANTS } from '../../../common/constants';

export class GetHistoryDto {
  @ApiPropertyOptional({ example: APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: APP_CONSTANTS.PAGINATION.DEFAULT_OFFSET })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

