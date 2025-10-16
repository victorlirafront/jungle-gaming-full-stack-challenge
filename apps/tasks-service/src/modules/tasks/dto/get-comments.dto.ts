import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCommentsDto {
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

