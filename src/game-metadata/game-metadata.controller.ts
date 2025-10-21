import { Controller, Get, Query } from '@nestjs/common';
import { GameMetadataService } from './game-metadata.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetGameMetadataDto } from './dto/get-game-metadata.dto';

@ApiTags('game-metadata')
@Controller('game-metadata')
export class GameMetadataController {
  constructor(private readonly gameMetadataService: GameMetadataService) {}

  /**
   * Get metadata for a specific game
   */
  @Get('game')
  @ApiOperation({
    summary: 'Get metadata for a specific game',
    description:
      'Returns game metadata including stadium information, location, capacity, attendance, referees, and other game details',
  })
  @ApiResponse({
    status: 200,
    description: 'Game metadata retrieved successfully',
  })
  getGameMetadata(@Query() dto: GetGameMetadataDto) {
    return this.gameMetadataService.getGameMetadata(dto);
  }
}
