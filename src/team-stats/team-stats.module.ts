import { Module } from '@nestjs/common';
import { TeamStatsService } from './team-stats.service';
import { TeamStatsController } from './team-stats.controller';

@Module({
  controllers: [TeamStatsController],
  providers: [TeamStatsService],
  exports: [TeamStatsService],
})
export class TeamStatsModule {}
