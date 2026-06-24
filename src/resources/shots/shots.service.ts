import { BaseResource } from "../../core/base-resource";
import type { HttpClient } from "../../core/http-client";

import type { ShotGameParams, ShotRoundParams, ShotSeasonParams, ShotSeasonsParams } from "./shots.dto";
import { type ShotEvent, ShotEventSchema } from "./shots.schema";

export class ShotsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getGame({ gameCode, season, validate }: ShotGameParams): Promise<ShotEvent[]> {
    return this.loadGame(season, gameCode, validate ?? true);
  }

  async getRound({ round, season, validate }: ShotRoundParams): Promise<ShotEvent[]> {
    return this.collectRoundGames(season, round, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  async getSeason({ season, validate }: ShotSeasonParams): Promise<ShotEvent[]> {
    return this.collectSeasonGames(season, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  async getSeasons({ from, to, validate }: ShotSeasonsParams): Promise<ShotEvent[]> {
    return this.collectSeasonsGames(from, to, (s, code) => this.loadGame(s, code, validate ?? true));
  }

  private async loadGame(season: number, gameCode: number, validate: boolean): Promise<ShotEvent[]> {
    const data = await this.http.getLiveFeed("Points", { gameCode, season });

    if (!validate) {
      return this.normalizeRows(data);
    }

    return this.parseArray(ShotEventSchema, data, "Points");
  }
}
