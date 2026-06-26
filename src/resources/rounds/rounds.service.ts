import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { ensureInteger } from "../../core/validation";

import type { RoundParams, RoundsListParams } from "./rounds.dto";
import { type Round, RoundSchema } from "./rounds.schema";

export class RoundsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async list({ season }: RoundsListParams): Promise<Round[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/rounds`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(RoundSchema, data, endpoint);
  }

  async get({ round, season }: RoundParams): Promise<Round> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/rounds/${ensureInteger(round, "round")}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(RoundSchema, data, endpoint);
  }
}
