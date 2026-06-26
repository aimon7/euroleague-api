import { BaseResource } from "../../core/base-resource";
import type { HttpClient } from "../../core/http-client";

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
}
