import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";

import type { StandingsRoundParams } from "./standings.dto";
import { type Standing, StandingSchema } from "./standings.schema";

const DEFAULT_STANDINGS_TYPE = "basicstandings";

export class StandingsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getRound(params: StandingsRoundParams): Promise<Standing[]> {
    const type = params.type ?? DEFAULT_STANDINGS_TYPE;
    const endpoint = `/seasons/${seasonCode(this.http.competition, params.season)}/rounds/${params.round}/${type}`;
    const data = await this.http.getApi("v3", endpoint);

    return this.parseArray(StandingSchema, data, endpoint);
  }
}
