import { Controller, Get, Param } from '@nestjs/common';
import { CoachesService } from './coaches.service';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoachRecord } from './entities/coach-record.entity';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get('competitions/:competitionCode/seasons/:seasonCode/coaches/:coachCode')
  @ApiOperation({
    summary: 'Get coach by code',
    description:
      'Returns the details of a coach by competition code, season code, and coach code',
  })
  @ApiParam({
    name: 'competitionCode',
    description: 'The code of the competition',
    example: 'E',
    required: true,
  })
  @ApiParam({
    name: 'seasonCode',
    description: 'The code of the season',
    example: 'Ε2025',
    required: true,
  })
  @ApiParam({
    name: 'coachCode',
    description: 'The code of the coach',
    example: '001869',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Coach data retrieved successfully',
    type: CoachRecord,
  })
  @ApiNotFoundResponse({
    description: 'Coach not found with the provided code',
  })
  async getCoach(
    @Param('competitionCode') competitionCode: string,
    @Param('seasonCode') seasonCode: string,
    @Param('coachCode') coachCode: string,
  ): Promise<CoachRecord> {
    return await this.coachesService.getCoach(
      competitionCode,
      seasonCode,
      coachCode,
    );
  }
}
