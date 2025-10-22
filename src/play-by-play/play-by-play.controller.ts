import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayByPlayService } from './play-by-play.service';
import {
  GetPlayByPlayDto,
  GetSeasonPlayByPlayDto,
} from './dto/get-play-by-play.dto';

@ApiTags('Play-by-Play')
@Controller('play-by-play')
export class PlayByPlayController {
  constructor(private readonly playByPlayService: PlayByPlayService) {}

  @Get('game')
  @ApiOperation({ summary: 'Get play-by-play data for a specific game' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed event-by-event game data',
  })
  async getPlayByPlay(@Query() dto: GetPlayByPlayDto) {
    return await this.playByPlayService.getPlayByPlay(dto);
  }

  @Get('season')
  @ApiOperation({ summary: 'Get play-by-play data for multiple games' })
  @ApiResponse({
    status: 200,
    description: 'Returns play-by-play data for multiple games',
  })
  async getSeasonPlayByPlay(@Query() dto: GetSeasonPlayByPlayDto) {
    return await this.playByPlayService.getSeasonPlayByPlay(dto);
  }
}
