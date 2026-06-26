import { BaseResource } from "../../core/base-resource";
import { seasonCode } from "../../core/config";
import { EuroleagueSchemaError } from "../../core/errors";
import type { HttpClient } from "../../core/http-client";
import { ensureOneOf, ensurePathSegment } from "../../core/validation";

import {
  PEOPLE_PHASE_TYPES,
  type PeoplePhaseType,
  type PersonCareerParams,
  type PersonCareerStatsParams,
  type PersonProfileParams,
  type PersonRecordsParams,
  type PersonSeasonRegistrationParams,
  type PersonSeasonStatsParams
} from "./people.dto";
import {
  type PersonProfile,
  type PersonRecord,
  PersonRecordSchema,
  type PersonRegistration,
  PersonRegistrationSchema,
  type PersonStats,
  PersonStatsSchema
} from "./people.schema";

export class PeopleService extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  async getProfile({ personCode }: PersonProfileParams): Promise<PersonProfile> {
    const endpoint = `/people/${ensurePathSegment(personCode, "personCode")}`;
    const registrations = await this.loadRegistrations(endpoint);

    return firstRow(registrations, endpoint).person;
  }

  async getCareer({ personCode }: PersonCareerParams): Promise<PersonRegistration[]> {
    const endpoint = `/people/${ensurePathSegment(personCode, "personCode")}`;

    return this.loadRegistrations(endpoint);
  }

  async getSeasonRegistration({ personCode, season }: PersonSeasonRegistrationParams): Promise<PersonRegistration> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/people/${ensurePathSegment(
      personCode,
      "personCode"
    )}`;
    const registrations = await this.loadRegistrations(endpoint);

    return firstRow(registrations, endpoint);
  }

  async getCareerStats({ personCode, phase }: PersonCareerStatsParams): Promise<PersonStats> {
    const endpoint = `/people/${ensurePathSegment(personCode, "personCode")}/stats`;
    const data = await this.http.getApi("v2", endpoint, { phaseTypeCode: phaseQuery(phase) });

    return this.parseRecord(PersonStatsSchema, data, endpoint);
  }

  async getSeasonStats({ personCode, phase, season }: PersonSeasonStatsParams): Promise<PersonStats> {
    const endpoint = `/seasons/${seasonCode(this.http.competition, season)}/people/${ensurePathSegment(
      personCode,
      "personCode"
    )}/stats`;
    const data = await this.http.getApi("v2", endpoint, { phaseTypeCode: phaseQuery(phase) });

    return this.parseRecord(PersonStatsSchema, data, endpoint);
  }

  async getRecords({ personCode }: PersonRecordsParams): Promise<PersonRecord[]> {
    const endpoint = `/people/${ensurePathSegment(personCode, "personCode")}/records`;
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(PersonRecordSchema, data, endpoint);
  }

  private async loadRegistrations(endpoint: string): Promise<PersonRegistration[]> {
    const data = await this.http.getApi("v2", endpoint);

    return this.parseArray(PersonRegistrationSchema, data, endpoint);
  }
}

function phaseQuery(phase: PeoplePhaseType | undefined): PeoplePhaseType | undefined {
  return phase === undefined ? undefined : ensureOneOf(phase, PEOPLE_PHASE_TYPES, "phase type");
}

function firstRow<T>(rows: T[], endpoint: string): T {
  const [row] = rows;

  if (row === undefined) {
    throw new EuroleagueSchemaError(`Euroleague API response did not contain a row for ${endpoint}.`, endpoint, []);
  }

  return row;
}
