import { Controller, Get, Query } from '@nestjs/common';
import { BoxscoreService } from './boxscore.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBoxscoreDto, GetSeasonBoxscoreDto } from './dto/get-boxscore.dto';

@ApiTags('Boxscore')
@Controller('boxscore')
export class BoxscoreController {
  constructor(private readonly boxscoreService: BoxscoreService) {}

  /**
   * Get boxscore data for a specific game
   */
  @Get('game')
  @ApiOperation({
    summary: 'Get boxscore for a specific game',
    description:
      'Returns detailed player and team statistics (points, rebounds, assists, etc.) for a specific game',
  })
  @ApiResponse({
    status: 200,
    description: 'Boxscore data retrieved successfully',
  })
  getBoxscore(@Query() dto: GetBoxscoreDto) {
    return this.boxscoreService.getBoxscore(dto);
  }

  /**
   * Get boxscore data for multiple games in a season with optional range filtering
   */
  @Get('season')
  @ApiOperation({
    summary: 'Get boxscore for multiple games in a season',
    description:
      'Returns boxscore data for multiple games. Optionally filter by game code range (startGameCode to endGameCode). If no range is specified, returns all games for the season.',
  })
  @ApiResponse({
    status: 200,
    description: 'Season boxscore data retrieved successfully',
  })
  getSeasonBoxscore(@Query() dto: GetSeasonBoxscoreDto) {
    return this.boxscoreService.getSeasonBoxscore(dto);
  }
}
