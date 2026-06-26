import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { ensurePathSegment } from "../../core/validation";

import type { ClubParams, ClubRosterParams, ClubsListParams } from "./clubs.dto";
import { type Club, ClubLogoSchema, type ClubRosterMember, ClubRosterMemberSchema, ClubSchema } from "./clubs.schema";

export class ClubsService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async list({ season }: ClubsListParams): Promise<Club[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/clubs`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(ClubSchema, data, endpoint);
  }

  async get({ clubCode, season }: ClubParams): Promise<Club> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/clubs/${ensurePathSegment(
      clubCode,
      "clubCode"
    )}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(ClubSchema, data, endpoint);
  }

  async getRoster({ clubCode, season }: ClubRosterParams): Promise<ClubRosterMember[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/clubs/${ensurePathSegment(
      clubCode,
      "clubCode"
    )}/people`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(ClubRosterMemberSchema, data, endpoint);
  }

  async getLogo({ clubCode, season }: ClubParams): Promise<string> {
    const url = new URL(`${this.http.hosts.wapi}/Team`);
    url.searchParams.set("code", clubCode);
    url.searchParams.set("season", seasonCode(this.http.competition, season));
    const endpoint = "wapi/Team";
    const data = await this.http.getUrl(url.toString());

    return this.parseRecord(ClubLogoSchema, data, endpoint);
  }
}
