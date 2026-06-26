export const PEOPLE_PHASE_TYPES = ["FF", "PO", "RS"] as const;
export type PeoplePhaseType = (typeof PEOPLE_PHASE_TYPES)[number];

export interface PersonCodeParams {
  personCode: string;
}

export type PersonProfileParams = PersonCodeParams;
export type PersonCareerParams = PersonCodeParams;
export type PersonRecordsParams = PersonCodeParams;

export interface PersonSeasonParams extends PersonCodeParams {
  season: number;
}

export type PersonSeasonRegistrationParams = PersonSeasonParams;

export interface PersonCareerStatsParams extends PersonCodeParams {
  phase?: PeoplePhaseType;
}

export interface PersonSeasonStatsParams extends PersonSeasonParams {
  phase?: PeoplePhaseType;
}
