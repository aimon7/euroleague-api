import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { rankByStatistic } from "../../core/ranking";
import { ensureOneOf } from "../../core/validation";

import {
  PLAYER_STATS_TYPES,
  type PlayerLeadersAllSeasonsParams,
  type PlayerLeadersParams,
  type PlayerLeadersRangeParams,
  type PlayerStatsAllSeasonsParams,
  type PlayerStatsParams,
  type PlayerStatsRangeParams
} from "./players.dto";
import { type PlayerLeader, type PlayerStat, PlayerStatSchema } from "./players.schema";

const DEFAULT_STATS_TYPE = "traditional";
const DEFAULT_STATS_MODE = "PerGame";
const DEFAULT_LIMIT = 400;

export class PlayersService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getStats(params: PlayerStatsParams): Promise<PlayerStat[]> {
    const type = ensureOneOf(params.type ?? DEFAULT_STATS_TYPE, PLAYER_STATS_TYPES, "player stats type");
    const endpoint = `/statistics/players/${type}`;
    const data = await this.http.getApi("v3", endpoint, {
      limit: params.limit ?? DEFAULT_LIMIT,
      phaseTypeCode: params.phase,
      seasonCode: seasonCode(this.http.competition, params.season),
      statisticMode: params.mode ?? DEFAULT_STATS_MODE
    });

    return this.parseArray(PlayerStatSchema, data, endpoint);
  }

  async getStatsRange(params: PlayerStatsRangeParams): Promise<PlayerStat[]> {
    const { from, to, ...rest } = params;

    return this.collectSeasonRange(from, to, (season) => this.getStats({ ...rest, season }));
  }

  async getStatsAllSeasons(params: PlayerStatsAllSeasonsParams = {}): Promise<PlayerStat[]> {
    return this.collectAllSeasons((season) => this.getStats({ ...params, season }));
  }

  async getLeaders(params: PlayerLeadersParams): Promise<PlayerLeader[]> {
    const { statistic, ...statsParams } = params;
    const rows = await this.getStats(statsParams);

    return rankByStatistic(rows, statistic);
  }

  /**
   * Leaders for each season in the range, concatenated. Ranking is applied
   * per season — this is not a single global ranking across all seasons.
   */
  async getLeadersRange(params: PlayerLeadersRangeParams): Promise<PlayerLeader[]> {
    const { from, to, ...rest } = params;

    return this.collectSeasonRange(from, to, (season) => this.getLeaders({ ...rest, season }));
  }

  /**
   * Leaders for every season, concatenated. Ranking is applied per season —
   * this is not a single global ranking across all seasons.
   */
  async getLeadersAllSeasons(params: PlayerLeadersAllSeasonsParams): Promise<PlayerLeader[]> {
    return this.collectAllSeasons((season) => this.getLeaders({ ...params, season }));
  }
}
