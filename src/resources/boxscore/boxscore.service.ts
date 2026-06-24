import { BaseResource } from "../../core/base-resource";
import type { HttpClient } from "../../core/http-client";
import { isRecord } from "../../core/normalize";

import type {
  BoxscoreGameParams,
  BoxscoreRoundParams,
  BoxscoreSeasonParams,
  BoxscoreSeasonsParams,
  QuarterScoresGameParams,
  QuarterScoresRoundParams,
  QuarterScoresSeasonParams,
  QuarterScoresSeasonsParams,
  QuarterScoreType
} from "./boxscore.dto";
import {
  type Boxscore,
  BoxscoreSchema,
  type PlayerBoxscore,
  PlayerBoxscoreSchema,
  type QuarterScore,
  QuarterScoreSchema
} from "./boxscore.schema";

const DEFAULT_QUARTER_TYPE: QuarterScoreType = "ByQuarter";

export class BoxscoreService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getGame({ gameCode, season }: BoxscoreGameParams): Promise<Boxscore> {
    const data = await this.http.getLiveFeed("Boxscore", { gameCode, season });

    return this.parseRecord(BoxscoreSchema, data, "Boxscore");
  }

  async getRound({ round, season }: BoxscoreRoundParams): Promise<Boxscore[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGameAsArray(s, code));
  }

  async getSeason({ season }: BoxscoreSeasonParams): Promise<Boxscore[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGameAsArray(s, code));
  }

  async getSeasons({ from, to }: BoxscoreSeasonsParams): Promise<Boxscore[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGameAsArray(s, code));
  }

  async getQuarterScores({ gameCode, season, type }: QuarterScoresGameParams): Promise<QuarterScore[]> {
    return this.loadQuarterScores(season, gameCode, type ?? DEFAULT_QUARTER_TYPE);
  }

  async getQuarterScoresRound({ round, season, type }: QuarterScoresRoundParams): Promise<QuarterScore[]> {
    return this.collectRoundGames(season, round, (s, code) =>
      this.loadQuarterScores(s, code, type ?? DEFAULT_QUARTER_TYPE)
    );
  }

  async getQuarterScoresSeason({ season, type }: QuarterScoresSeasonParams): Promise<QuarterScore[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadQuarterScores(s, code, type ?? DEFAULT_QUARTER_TYPE));
  }

  async getQuarterScoresSeasons({ from, to, type }: QuarterScoresSeasonsParams): Promise<QuarterScore[]> {
    return this.collectSeasonsGames(from, to, (s, code) =>
      this.loadQuarterScores(s, code, type ?? DEFAULT_QUARTER_TYPE)
    );
  }

  async getPlayerStats({ gameCode, season }: BoxscoreGameParams): Promise<PlayerBoxscore[]> {
    return this.loadPlayerStats(season, gameCode);
  }

  async getPlayerStatsRound({ round, season }: BoxscoreRoundParams): Promise<PlayerBoxscore[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadPlayerStats(s, code));
  }

  async getPlayerStatsSeason({ season }: BoxscoreSeasonParams): Promise<PlayerBoxscore[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadPlayerStats(s, code));
  }

  async getPlayerStatsSeasons({ from, to }: BoxscoreSeasonsParams): Promise<PlayerBoxscore[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadPlayerStats(s, code));
  }

  private async loadGameAsArray(season: number, gameCode: number): Promise<Boxscore[]> {
    return [await this.getGame({ gameCode, season })];
  }

  private async loadQuarterScores(season: number, gameCode: number, type: QuarterScoreType): Promise<QuarterScore[]> {
    const data = await this.http.getLiveFeed("Boxscore", { gameCode, season });
    const section = isRecord(data) ? data[type] : undefined;

    return this.parseArray(QuarterScoreSchema, section, "Boxscore");
  }

  private async loadPlayerStats(season: number, gameCode: number): Promise<PlayerBoxscore[]> {
    const data = await this.http.getLiveFeed("Boxscore", { gameCode, season });

    return this.parseArray(PlayerBoxscoreSchema, buildPlayerRows(data), "Boxscore");
  }
}

function buildPlayerRows(data: unknown): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  if (!isRecord(data) || !Array.isArray(data.Stats)) {
    return rows;
  }

  for (const team of data.Stats) {
    if (!isRecord(team) || !Array.isArray(team.PlayersStats)) {
      continue;
    }

    for (const player of team.PlayersStats) {
      if (isRecord(player)) {
        rows.push({ teamName: team.Team, ...player });
      }
    }
  }

  return rows;
}
