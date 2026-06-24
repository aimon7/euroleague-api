import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";

import type { ScheduleRoundParams, ScheduleSeasonParams, ScheduleSeasonsParams } from "./schedule.dto";
import { type ScheduleGame, ScheduleGameSchema } from "./schedule.schema";

export class ScheduleService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getSeason(params: ScheduleSeasonParams): Promise<ScheduleGame[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, params.season)}/games`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(ScheduleGameSchema, data, endpoint);
  }

  async getRound(params: ScheduleRoundParams): Promise<ScheduleGame[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, params.season)}/games`;
    const data = await this.http.getApi("v2", endpoint, { roundNumber: params.round });

    return this.parseArray(ScheduleGameSchema, data, endpoint);
  }

  async getSeasons(params: ScheduleSeasonsParams): Promise<ScheduleGame[]> {
    const { from, to } = params;

    return this.collectSeasonRange(from, to, (season) => this.getSeason({ season }));
  }
}
