# @aimon7/euroleague-api

A comprehensive TypeScript/NestJS SDK for accessing Euroleague and Eurocup basketball data.

[![npm version](https://badge.fury.io/js/%40aimon7%2Feuroleague-api.svg)](https://badge.fury.io/js/%40aimon7%2Feuroleague-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🏀 Features

- **Complete TypeScript SDK** - Fully typed interfaces for all API responses
- **NestJS Integration** - Built with NestJS for enterprise-grade architecture
- **Comprehensive Coverage** - Access to:
  - Game Statistics (reports, stats, team comparisons)
  - Player Statistics (traditional, advanced, misc, scoring)
  - Team Statistics (traditional, advanced, opponents)
  - Standings (basic, streaks, margins, calendar)
  - Shot Data (shot-level analytics)
  - Play-by-Play Data (game events)
  - Boxscore Data
  - Game Metadata (stadium, referees, capacity)
- **Validation** - Built-in request/response validation using class-validator
- **OpenAPI Documentation** - Auto-generated Swagger documentation
- **Dual Mode** - Use as library/SDK or run as a REST API server for testing

## 📦 Installation

```bash
npm install @aimon7/euroleague-api
# or
pnpm add @aimon7/euroleague-api
# or
yarn add @aimon7/euroleague-api
```

## 🚀 Quick Start

### As a Library/SDK

#### Option A: Standalone Usage (Node.js, Express, Fastify, React, Angular, Vue, etc.)

You can use the library in any JavaScript/TypeScript project without NestJS. The library handles Axios internally:

```typescript
import { createEuroleagueClient } from '@aimon7/euroleague-api';

// Create a client with all services initialized
const client = createEuroleagueClient({
  competition: 'E', // Optional, defaults to 'E' (Euroleague)
  timeout: 60000,    // Optional, defaults to 60000ms
});

// Use any service
async function getData() {
  const gameStats = await client.gameStats.getGameStats(2023, 1);
  const playerStats = await client.playerStats.getPlayerStatsSingleSeason({
    endpoint: 'traditional',
    season: 2023,
  });
  
  return { gameStats, playerStats };
}
```

**React Example:**

```typescript
import { useEffect, useState } from 'react';
import { createEuroleagueClient } from '@aimon7/euroleague-api';

// Create client once (outside component or use useMemo)
const euroleagueClient = createEuroleagueClient();

function GameStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    euroleagueClient.gameStats
      .getGameStats(2023, 1)
      .then(setStats)
      .catch(console.error);
  }, []);

  return <div>{stats ? JSON.stringify(stats) : 'Loading...'}</div>;
}
```

**Express Example:**

```typescript
import express from 'express';
import { createEuroleagueClient } from '@aimon7/euroleague-api';

const app = express();

// Initialize client once
const euroleague = createEuroleagueClient();

app.get('/games/:season/:gameCode', async (req, res) => {
  try {
    const { season, gameCode } = req.params;
    const stats = await euroleague.gameStats.getGameStats(+season, +gameCode);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/players/:season', async (req, res) => {
  try {
    const { season } = req.params;
    const stats = await euroleague.playerStats.getPlayerStatsSingleSeason({
      endpoint: 'traditional',
      season: +season,
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

#### Option B: NestJS Integration

```typescript
import { EuroleagueApiModule, GameStatsService } from '@aimon7/euroleague-api';

// In your NestJS module
@Module({
  imports: [EuroleagueApiModule],
})
export class AppModule {}

// In your service
@Injectable()
export class MyService {
  constructor(private readonly gameStatsService: GameStatsService) {}

  async getGameData() {
    // Get stats for a specific game
    const gameStats = await this.gameStatsService.getGameStats(2023, 1);
    
    // Get all games for a season
    const seasonStats = await this.gameStatsService.getSeasonGameStats(2023);
    
    return gameStats;
  }
}
```

### As a Development/Test Server

For testing and development, run the API as a standalone server:

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

Then visit:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api/json

## 📚 Description

A TypeScript/NestJS implementation inspired by the Python [euroleague_api](https://github.com/giasemidis/euroleague_api) package.

## 📖 API Documentation

### 🎮 Game Stats Module

Get game statistics, reports, and team comparisons.

```typescript
import { GameStatsService, Competition } from '@aimon7/euroleague-api';

// Single game stats
await gameStatsService.getGameStats(seasonCode, gameCode);

// Game report
await gameStatsService.getGameReport(seasonCode, gameCode);

// Team comparison
await gameStatsService.getGameTeamsComparison(seasonCode, gameCode);

// All games in season
await gameStatsService.getSeasonGameStats(seasonCode, Competition.EUROLEAGUE);

// All games in round
await gameStatsService.getRoundGameStats(seasonCode, roundNumber);

// Multiple seasons range
await gameStatsService.getRangeSeasonsGameStats(startSeason, endSeason);
```

### 👤 Player Stats Module

Access player statistics (traditional, advanced, miscellaneous, and scoring).

```typescript
import { PlayerStatsService, StatisticMode, PhaseType } from '@aimon7/euroleague-api';

// Traditional player stats
await playerStatsService.getPlayerStats(
  'Traditional',
  seasonCode,
  StatisticMode.PER_GAME,
  PhaseType.REGULAR_SEASON
);

// Advanced player stats
await playerStatsService.getPlayerStats('Advanced', seasonCode);
```

### 🏆 Team Stats Module

Retrieve team statistics including traditional, advanced, and opponent stats.

```typescript
import { TeamStatsService } from '@aimon7/euroleague-api';

await teamStatsService.getTeamStats('Traditional', seasonCode);
await teamStatsService.getTeamStats('Opponent', seasonCode);
```

### 📊 Standings Module

Get league standings with various options.

```typescript
import { StandingsService } from '@aimon7/euroleague-api';

// Basic standings
await standingsService.getStandings(seasonCode);

// With streaks
await standingsService.getStandings(seasonCode, 'Streaks');
```

### 🎯 Shot Data Module

Access detailed shot-level analytics with coordinates and outcomes.

```typescript
import { ShotDataService } from '@aimon7/euroleague-api';

// Get shot data for a specific game
await shotDataService.getShotData({ 
  season: 2023, 
  gameCode: 1 
});

// Get shot data for multiple games in a season
await shotDataService.getSeasonShotData({ 
  season: 2023 
});

// Get shot data for a range of games
await shotDataService.getSeasonShotData({ 
  season: 2023,
  startGameCode: 1,
  endGameCode: 10
});
```

### 📝 Play-by-Play Module

Get detailed game events and timeline.

```typescript
import { PlayByPlayService } from '@aimon7/euroleague-api';

// Get play-by-play for a specific game
await playByPlayService.getPlayByPlay({ 
  season: 2023, 
  gameCode: 1 
});

// Get play-by-play for multiple games in a season
await playByPlayService.getSeasonPlayByPlay({ 
  season: 2023 
});

// Get play-by-play for a range of games
await playByPlayService.getSeasonPlayByPlay({ 
  season: 2023,
  startGameCode: 1,
  endGameCode: 10
});
```

### 📦 Boxscore Module

Retrieve detailed player and team statistics for games.

```typescript
import { BoxscoreService } from '@aimon7/euroleague-api';

// Get boxscore for a specific game
await boxscoreService.getBoxscore({ 
  season: 2023, 
  gameCode: 1 
});

// Get boxscore for multiple games in a season
await boxscoreService.getSeasonBoxscore({ 
  season: 2023 
});

// Get boxscore for a range of games
await boxscoreService.getSeasonBoxscore({ 
  season: 2023,
  startGameCode: 1,
  endGameCode: 10
});
```

### 🏟️ Game Metadata Module

Get stadium, referee, attendance, and capacity information.

```typescript
import { GameMetadataService } from '@aimon7/euroleague-api';

// Get metadata for a specific game
await gameMetadataService.getGameMetadata({ 
  season: 2023, 
  gameCode: 1 
});
```

## 🏗️ Architecture

The SDK follows a modular architecture:

- **Core Services**: `EuroleagueHttpService` and `EuroleagueBaseService` provide base functionality
- **Feature Modules**: Each API domain (game stats, player stats, etc.) is a separate NestJS module
- **DTOs**: Request/response validation using `class-validator`
- **Type Safety**: Full TypeScript support with generated types
- **Error Handling**: Comprehensive error handling with meaningful messages

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run start:dev

# Build library
pnpm run build:lib

# Lint
pnpm run lint

# Format
pnpm run format
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Inspired by the Python [euroleague_api](https://github.com/giasemidis/euroleague_api) package by [giasemidis](https://github.com/giasemidis).

## 📞 Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/aimon7/euroleague-api).
