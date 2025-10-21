import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShotDataService } from './shot-data.service';
import { GetShotDataDto, GetSeasonShotDataDto } from './dto/get-shot-data.dto';

@ApiTags('shot-data')
@Controller('shot-data')
export class ShotDataController {
  constructor(private readonly shotDataService: ShotDataService) {}

  @Get('game')
  @ApiOperation({ summary: 'Get shot data for a specific game' })
  @ApiResponse({
    status: 200,
    description: 'Returns shot-level data including coordinates and outcomes',
  })
  async getShotData(@Query() dto: GetShotDataDto) {
    return await this.shotDataService.getShotData(dto);
  }

  @Get('season')
  @ApiOperation({ summary: 'Get shot data for multiple games in a season' })
  @ApiResponse({
    status: 200,
    description: 'Returns shot data for multiple games',
  })
  async getSeasonShotData(@Query() dto: GetSeasonShotDataDto) {
    return await this.shotDataService.getSeasonShotData(dto);
  }
}
