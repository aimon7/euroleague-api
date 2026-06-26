import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { ensureOneOf } from "../../core/validation";

import {
  TEAM_STATS_TYPES,
  type TeamLeadersAllSeasonsParams,
  type TeamLeadersParams,
  type TeamLeadersRangeParams,
  type TeamStatsAllSeasonsParams,
  type TeamStatsParams,
  type TeamStatsRangeParams
} from "./teams.dto";
import { type TeamLeader, type TeamStat, TeamStatSchema } from "./teams.schema";

const DEFAULT_STATS_TYPE = "traditional";
const DEFAULT_STATS_MODE = "PerGame";
const DEFAULT_LIMIT = 400;

export class TeamsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getStats(params: TeamStatsParams): Promise<TeamStat[]> {
    const type = ensureOneOf(params.type ?? DEFAULT_STATS_TYPE, TEAM_STATS_TYPES, "team stats type");
    const endpoint = `/statistics/teams/${type}`;
    const data = await this.http.getApi("v3", endpoint, {
      limit: params.limit ?? DEFAULT_LIMIT,
      phaseTypeCode: params.phase,
      seasonCode: seasonCode(this.http.competition, params.season),
      statisticMode: params.mode ?? DEFAULT_STATS_MODE
    });

    return this.parseArray(TeamStatSchema, data, endpoint);
  }

  async getStatsRange(params: TeamStatsRangeParams): Promise<TeamStat[]> {
    const { from, to, ...rest } = params;

    return this.collectSeasonRange(from, to, (season) => this.getStats({ ...rest, season }));
  }

  async getStatsAllSeasons(params: TeamStatsAllSeasonsParams = {}): Promise<TeamStat[]> {
    return this.collectAllSeasons((season) => this.getStats({ ...params, season }));
  }

  async getLeaders(params: TeamLeadersParams): Promise<TeamLeader[]> {
    const { statistic, ...statsParams } = params;
    const rows = await this.getStats(statsParams);

    return this.rankByStatistic(rows, statistic);
  }

  async getLeadersRange(params: TeamLeadersRangeParams): Promise<TeamLeader[]> {
    const { from, to, ...rest } = params;

    return this.collectSeasonRange(from, to, (season) => this.getLeaders({ ...rest, season }));
  }

  async getLeadersAllSeasons(params: TeamLeadersAllSeasonsParams): Promise<TeamLeader[]> {
    const { statistic, ...rest } = params;

    return this.collectAllSeasons((season) => this.getLeaders({ ...rest, season, statistic }));
  }
}
