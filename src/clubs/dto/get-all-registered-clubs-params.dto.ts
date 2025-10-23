import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GetAllRegisteredClubsParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'The limit of clubs to return',
    minimum: 1,
  })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'The offset for pagination',
    minimum: 0,
  })
  offset?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filter clubs that have a parent club',
  })
  hasParentClub?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search clubs by name or alias',
  })
  search?: string;
}
