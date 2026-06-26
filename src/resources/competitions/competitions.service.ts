import { BaseResource } from "../../core/base-resource";
import { competitionCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";

import { type CompetitionInfo, CompetitionInfoSchema } from "./competitions.schema";

export class CompetitionsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  // `getApi("v2", ...)` always injects `/competitions/{E|U}` into the path, so it
  // cannot express the bare catalog. We hit `hosts.v2` directly via `getUrl`.
  async list(): Promise<CompetitionInfo[]> {
    const endpoint = `${this.http.hosts.v2}/competitions`;
    const data = await this.http.getUrl(endpoint);

    return this.parseArray(CompetitionInfoSchema, data, endpoint);
  }

  async get(): Promise<CompetitionInfo> {
    const endpoint = `${this.http.hosts.v2}/competitions/${competitionCode(this.http.competition)}`;
    const data = await this.http.getUrl(endpoint);

    return this.parseRecord(CompetitionInfoSchema, data, endpoint);
  }
}
