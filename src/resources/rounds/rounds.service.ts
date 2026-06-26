import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import { EuroleagueValidationError } from "../../core/errors";
import type { HttpClient } from "../../core/http-client";

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
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/rounds/${ensureRoundNumber(round)}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(RoundSchema, data, endpoint);
  }
}

// `round` is interpolated into the request path. The TypeScript types already
// guarantee a number, but a caller bypassing the types (e.g. via `as any`) could
// otherwise inject path traversal segments, so reject anything that is not a
// finite integer before building the URL.
function ensureRoundNumber(round: number): number {
  if (!Number.isInteger(round)) {
    throw new EuroleagueValidationError(`Expected round to be a finite integer. Received: ${String(round)}`);
  }

  return round;
}
