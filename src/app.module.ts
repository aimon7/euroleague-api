import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { EuroleagueApiModule } from './euroleague-api.module';
import { GameStatsModule } from './game-stats/game-stats.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { TeamStatsModule } from './team-stats/team-stats.module';
import { StandingsModule } from './standings/standings.module';
import { ShotDataModule } from './shot-data/shot-data.module';
import { PlayByPlayModule } from './play-by-play/play-by-play.module';
import { BoxscoreModule } from './boxscore/boxscore.module';
import { GameMetadataModule } from './game-metadata/game-metadata.module';
import { ClubsModule } from './clubs/clubs.module';

/**
 * App Module for Development Server
 * This is used only when running the development/test server
 * For library usage, import EuroleagueApiModule instead
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    EuroleagueApiModule,
    GameStatsModule,
    PlayerStatsModule,
    TeamStatsModule,
    StandingsModule,
    ShotDataModule,
    PlayByPlayModule,
    BoxscoreModule,
    GameMetadataModule,
    ClubsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
