import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { TeamStatsModule } from './team-stats/team-stats.module';
import { StandingsModule } from './standings/standings.module';
import { ShotDataModule } from './shot-data/shot-data.module';
import { PlayByPlayModule } from './play-by-play/play-by-play.module';
import { BoxscoreModule } from './boxscore/boxscore.module';
import { GameMetadataModule } from './game-metadata/game-metadata.module';
import { GameStatsModule } from './game-stats/game-stats.module';

/**
 * Main Euroleague API Module
 * Can be imported in other NestJS applications or used standalone
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    GameStatsModule,
    PlayerStatsModule,
    TeamStatsModule,
    StandingsModule,
    ShotDataModule,
    PlayByPlayModule,
    BoxscoreModule,
    GameMetadataModule,
  ],
  exports: [
    GameStatsModule,
    PlayerStatsModule,
    TeamStatsModule,
    StandingsModule,
    ShotDataModule,
    PlayByPlayModule,
    BoxscoreModule,
    GameMetadataModule,
  ],
})
export class EuroleagueApiModule {}
