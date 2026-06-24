import { BaseResource } from "../../core/base-resource";
import type { HttpClient } from "../../core/http-client";
import { normalizeApiRecordDeep } from "../../core/normalize";

import type {
  PlayByPlayGameParams,
  PlayByPlayRoundParams,
  PlayByPlaySeasonParams,
  PlayByPlaySeasonsParams
} from "./play-by-play.dto";
import {
  type PlayByPlayEvent,
  PlayByPlayEventSchema,
  type PlayByPlayLineup,
  PlayByPlayLineupSchema
} from "./play-by-play.schema";

const PERIODS: ReadonlyArray<readonly [string, number]> = [
  ["FirstQuarter", 1],
  ["SecondQuarter", 2],
  ["ThirdQuarter", 3],
  ["ForthQuarter", 4],
  ["ExtraTime", 5]
];

export class PlayByPlayService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getGame({ gameCode, season, validate }: PlayByPlayGameParams): Promise<PlayByPlayEvent[]> {
    return this.loadGame(season, gameCode, validate ?? true);
  }

  async getRound({ round, season, validate }: PlayByPlayRoundParams): Promise<PlayByPlayEvent[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  async getSeason({ season, validate }: PlayByPlaySeasonParams): Promise<PlayByPlayEvent[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  async getSeasons({ from, to, validate }: PlayByPlaySeasonsParams): Promise<PlayByPlayEvent[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  async getLineups({ gameCode, season, validate }: PlayByPlayGameParams): Promise<PlayByPlayLineup[]> {
    return this.loadLineups(season, gameCode, validate ?? true);
  }

  async getLineupsRound({ round, season, validate }: PlayByPlayRoundParams): Promise<PlayByPlayLineup[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadLineups(s, code, validate ?? true));
  }

  async getLineupsSeason({ season, validate }: PlayByPlaySeasonParams): Promise<PlayByPlayLineup[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadLineups(s, code, validate ?? true));
  }

  async getLineupsSeasons({ from, to, validate }: PlayByPlaySeasonsParams): Promise<PlayByPlayLineup[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadLineups(s, code, validate ?? true));
  }

  private async loadGame(season: number, gameCode: number, validate: boolean): Promise<PlayByPlayEvent[]> {
    const data = await this.http.getLiveFeed("PlaybyPlay", { gameCode, season });
    const events = mergeEvents(data);

    if (!validate) {
      return this.normalizeRows(events);
    }

    return this.parseArray(PlayByPlayEventSchema, events, "PlaybyPlay");
  }

  private async loadLineups(season: number, gameCode: number, validate: boolean): Promise<PlayByPlayLineup[]> {
    const pbp = await this.http.getLiveFeed("PlaybyPlay", { gameCode, season });
    const boxscore = await this.http.getLiveFeed("Boxscore", { gameCode, season });
    const enriched = buildLineups(pbp, boxscore);

    if (!validate) {
      return enriched.map((row) => normalizeApiRecordDeep(row));
    }

    return this.parseArray(PlayByPlayLineupSchema, enriched, "PlaybyPlay");
  }
}

function mergeEvents(data: unknown): Record<string, unknown>[] {
  const events: Record<string, unknown>[] = [];

  if (!isRecord(data)) {
    return events;
  }

  for (const [key, period] of PERIODS) {
    const section = data[key];

    if (Array.isArray(section)) {
      for (const event of section) {
        if (isRecord(event)) {
          events.push({ ...event, period });
        }
      }
    }
  }

  return events;
}

function buildLineups(pbp: unknown, boxscore: unknown): Record<string, unknown>[] {
  const events = mergeEvents(pbp);
  const codeTeamA = isRecord(pbp) ? text(pbp.CodeTeamA) : "";
  const codeTeamB = isRecord(pbp) ? text(pbp.CodeTeamB) : "";

  const teamStats = isRecord(boxscore) && Array.isArray(boxscore.Stats) ? boxscore.Stats : [];
  const home = starterMap(teamStats[0]);
  const away = starterMap(teamStats[1]);

  return events.map((event) => {
    const side = teamSide(text(event.CODETEAM), codeTeamA, codeTeamB);
    const playType = text(event.PLAYTYPE);
    const playerId = text(event.PLAYER_ID);
    const playerName = text(event.PLAYER);
    const onCourt = side === "home" ? home : side === "away" ? away : undefined;

    if (onCourt && playerId && playType === "IN") {
      onCourt.set(playerId, playerName);
    }

    const enriched = {
      ...event,
      homeLineup: [...home.values()],
      awayLineup: [...away.values()]
    };

    if (onCourt && playerId && playType === "OUT") {
      onCourt.delete(playerId);
    }

    return enriched;
  });
}

function starterMap(teamStat: unknown): Map<string, string> {
  const map = new Map<string, string>();

  if (!isRecord(teamStat) || !Array.isArray(teamStat.PlayersStats)) {
    return map;
  }

  const players = teamStat.PlayersStats.filter(isRecord);
  const flagged = players.filter(isStarter);
  const chosen = flagged.length > 0 ? flagged : players.slice(0, 5);

  for (const player of chosen) {
    const id = text(player.Player_ID ?? player.PLAYER_ID);

    if (id) {
      map.set(id, text(player.Player ?? player.PLAYER));
    }
  }

  return map;
}

function isStarter(player: Record<string, unknown>): boolean {
  const flag = player.IsStarter ?? player.Starter ?? player.St ?? player.isStarter;

  return flag === true || flag === 1 || flag === "1";
}

function teamSide(code: string, codeTeamA: string, codeTeamB: string): "away" | "home" | undefined {
  if (code && code === codeTeamA) {
    return "home";
  }

  if (code && code === codeTeamB) {
    return "away";
  }

  return undefined;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
