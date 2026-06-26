import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import type { HttpClient } from "../../core/http-client";
import { ensurePathSegment } from "../../core/validation";

import type { PhaseParams, PhasesListParams } from "./phases.dto";
import { type Phase, PhaseSchema } from "./phases.schema";

export class PhasesService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async list({ season }: PhasesListParams): Promise<Phase[]> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/phases`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(PhaseSchema, data, endpoint);
  }

  async get({ phase, season }: PhaseParams): Promise<Phase> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/phases/${ensurePathSegment(
      phase,
      "phase"
    )}`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseRecord(PhaseSchema, data, endpoint);
  }
}
