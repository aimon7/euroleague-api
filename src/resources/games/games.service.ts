import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { ensureInteger, ensureOneOf } from "../../core/validation";

import type { GameRef, GameRoundParams, GameSeasonParams, GameSeasonsParams } from "./games.dto";
import {
  type GameComparison,
  GameComparisonSchema,
  type GameInfo,
  GameInfoSchema,
  type GameReport,
  GameReportSchema,
  type GameStats,
  GameStatsSchema,
  type GameTeamsComparison,
  GameTeamsComparisonSchema,
  type PointsBreakdown,
  PointsBreakdownSchema,
  type ScoreEvolution,
  ScoreEvolutionSchema
} from "./games.schema";

const GAME_ENDPOINTS = ["report", "stats", "teamsComparison"] as const;
type GameEndpoint = (typeof GAME_ENDPOINTS)[number];

export class GamesService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getGame({ gameCode, season }: GameRef): Promise<GameInfo> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/games/${ensureInteger(gameCode, "gameCode")}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(GameInfoSchema, data, endpoint);
  }

  async getPointsBreakdown({ gameCode, season }: GameRef): Promise<PointsBreakdown> {
    const data = await this.http.getLiveFeed("ShootingGraphic", { gameCode, season });

    return this.parseRecord(PointsBreakdownSchema, data, "ShootingGraphic");
  }

  async getComparison({ gameCode, season }: GameRef): Promise<GameComparison> {
    const data = await this.http.getLiveFeed("Comparison", { gameCode, season });

    return this.parseRecord(GameComparisonSchema, data, "Comparison");
  }

  async getScoreEvolution({ gameCode, season }: GameRef): Promise<ScoreEvolution> {
    const data = await this.http.getLiveFeed("Evolution", { gameCode, season });

    return this.parseRecord(ScoreEvolutionSchema, data, "Evolution");
  }

  async getReport({ gameCode, season }: GameRef): Promise<GameReport> {
    return this.loadGame(season, gameCode, "report");
  }

  async getReportRound({ round, season }: GameRoundParams): Promise<GameReport[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGameAsArray(s, code, "report"));
  }

  async getReportSeason({ season }: GameSeasonParams): Promise<GameReport[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGameAsArray(s, code, "report"));
  }

  async getReportSeasons({ from, to }: GameSeasonsParams): Promise<GameReport[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGameAsArray(s, code, "report"));
  }

  async getStats({ gameCode, season }: GameRef): Promise<GameStats> {
    return this.loadGame(season, gameCode, "stats");
  }

  async getStatsRound({ round, season }: GameRoundParams): Promise<GameStats[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGameAsArray(s, code, "stats"));
  }

  async getStatsSeason({ season }: GameSeasonParams): Promise<GameStats[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGameAsArray(s, code, "stats"));
  }

  async getStatsSeasons({ from, to }: GameSeasonsParams): Promise<GameStats[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGameAsArray(s, code, "stats"));
  }

  async getTeamsComparison({ gameCode, season }: GameRef): Promise<GameTeamsComparison> {
    return this.loadGame(season, gameCode, "teamsComparison");
  }

  async getTeamsComparisonRound({ round, season }: GameRoundParams): Promise<GameTeamsComparison[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGameAsArray(s, code, "teamsComparison"));
  }

  async getTeamsComparisonSeason({ season }: GameSeasonParams): Promise<GameTeamsComparison[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGameAsArray(s, code, "teamsComparison"));
  }

  async getTeamsComparisonSeasons({ from, to }: GameSeasonsParams): Promise<GameTeamsComparison[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGameAsArray(s, code, "teamsComparison"));
  }

  private async loadGame(season: number, gameCode: number, type: GameEndpoint): Promise<GameReport> {
    ensureOneOf(type, GAME_ENDPOINTS, "game endpoint");
    ensureInteger(gameCode, "gameCode");
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/games/${gameCode}/${type}`;
    const data = await this.http.getApi("v3", endpoint);

    return this.parseRecord(schemaFor(type), data, endpoint);
  }

  private async loadGameAsArray(season: number, gameCode: number, type: GameEndpoint): Promise<GameReport[]> {
    return [await this.loadGame(season, gameCode, type)];
  }
}

function schemaFor(type: GameEndpoint): typeof GameReportSchema {
  switch (type) {
    case "report":
      return GameReportSchema;
    case "stats":
      return GameStatsSchema;
    case "teamsComparison":
      return GameTeamsComparisonSchema;
  }
}
