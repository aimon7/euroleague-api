// Main library exports
export * from './euroleague-api.module';

// Client Factory (recommended for standalone usage)
export * from './client-factory';

// Core Module and Services
export * from './core/core.module';
export * from './core/euroleague-http.service';
export * from './core/euroleague-base.service';

// DTOs and Enums
export * from './common/enums/competition.enum';
export * from './common/enums/phase-type.enum';
export * from './common/enums/statistic-mode.enum';

// Modules - Game Stats
export * from './game-stats/game-stats.module';
export * from './game-stats/game-stats.service';
export * from './game-stats/game-stats.controller';
export * from './game-stats/dto/get-game-stats.dto';

// Modules - Player Stats
export * from './player-stats/player-stats.module';
export * from './player-stats/player-stats.service';
export * from './player-stats/player-stats.controller';
export * from './player-stats/dto/get-player-stats.dto';

// Modules - Team Stats
export * from './team-stats/team-stats.module';
export * from './team-stats/team-stats.service';
export * from './team-stats/team-stats.controller';
export * from './team-stats/dto/get-team-stats.dto';

// Modules - Standings
export * from './standings/standings.module';
export * from './standings/standings.service';
export * from './standings/standings.controller';
export * from './standings/dto/get-standings.dto';

// Modules - Shot Data
export * from './shot-data/shot-data.module';
export * from './shot-data/shot-data.service';
export * from './shot-data/shot-data.controller';
export * from './shot-data/dto/get-shot-data.dto';

// Modules - Play By Play
export * from './play-by-play/play-by-play.module';
export * from './play-by-play/play-by-play.service';
export * from './play-by-play/play-by-play.controller';
export * from './play-by-play/dto/get-play-by-play.dto';

// Modules - Boxscore
export * from './boxscore/boxscore.module';
export * from './boxscore/boxscore.service';
export * from './boxscore/boxscore.controller';
export * from './boxscore/dto/get-boxscore.dto';

// Modules - Game Metadata
export * from './game-metadata/game-metadata.module';
export * from './game-metadata/game-metadata.service';
export * from './game-metadata/game-metadata.controller';
export * from './game-metadata/dto/get-game-metadata.dto';
