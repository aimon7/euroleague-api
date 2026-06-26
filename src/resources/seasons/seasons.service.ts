import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";

import type { SeasonGetParams } from "./seasons.dto";
import { type Season, SeasonSchema } from "./seasons.schema";

const ENDPOINT = "/seasons";

export class SeasonsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async list(): Promise<Season[]> {
    const data = await this.http.getApi("v2", ENDPOINT);

    return this.parseArray(SeasonSchema, data, ENDPOINT);
  }

  async get({ season }: SeasonGetParams): Promise<Season> {
    const endpoint = `${ENDPOINT}/${seasonCode(this.http.competition, season)}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(SeasonSchema, data, endpoint);
  }
}
