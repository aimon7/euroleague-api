import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError, EuroleagueValidationError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import careerFixture from "./__fixtures__/people-career.json";
import recordsFixture from "./__fixtures__/people-records.json";
import statsFixture from "./__fixtures__/people-stats.json";
import { type PeoplePhaseType, PeopleService } from "./index";

describe("PeopleService", () => {
  it("builds the profile URL and returns the first registration person", async () => {
    const { calls, service } = createService(careerFixture);

    const profile = await service.getProfile({ personCode: "013380" });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/people/013380");
    expect(profile).toMatchObject({
      code: "013380",
      country: { code: "FRA" },
      name: "FOURNIER, EVAN"
    });
    expect(typeof profile.code).toBe("string");
  });

  it("returns all career registration rows", async () => {
    const { service } = createService(careerFixture);

    const career = await service.getCareer({ personCode: "013380" });

    expect(career).toHaveLength(1);
    expect(career[0]).toMatchObject({
      club: { code: "OLY" },
      dorsal: "94",
      person: { code: "013380" },
      season: { code: "E2024" }
    });
  });

  it("uses the configured EuroCup competition code for season registration", async () => {
    const { calls, service } = createService(careerFixture, "eurocup");

    const registration = await service.getSeasonRegistration({ personCode: "013380", season: 2024 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v2/competitions/U/seasons/U2024/people/013380"
    );
    expect(registration.positionName).toBe("Forward");
  });

  it("builds the career stats URL and validates the phase filter", async () => {
    const { calls, service } = createService(statsFixture);

    const stats = await service.getCareerStats({ personCode: "013380", phase: "PO" });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/people/013380/stats");
    expect(url.searchParams.get("phaseTypeCode")).toBe("PO");
    expect(stats.accumulated.points).toBe(506);
    expect(stats.games[0]).toMatchObject({
      game: { gameCode: 7, local: { club: { code: "ULK" } } },
      playerClubCode: "OLY",
      stats: { points: 5 }
    });
  });

  it("builds the season stats URL with a phase filter", async () => {
    const { calls, service } = createService(statsFixture);

    const stats = await service.getSeasonStats({ personCode: "013380", phase: "RS", season: 2024 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v2/competitions/E/seasons/E2024/people/013380/stats"
    );
    expect(url.searchParams.get("phaseTypeCode")).toBe("RS");
    expect(stats.averagePerGame.points).toBe(15.8);
  });

  it("builds the records URL and parses a bare records array", async () => {
    const { calls, service } = createService(recordsFixture);

    const records = await service.getRecords({ personCode: "013380" });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/people/013380/records");
    expect(records).toEqual([
      expect.objectContaining({ clubCode: "OLY", played: 40, seasonCode: "E2024", won: 28 }),
      expect.objectContaining({ clubCode: "OLY", played: 43, seasonCode: "E2025", won: 31 })
    ]);
  });

  it("rejects injected person codes and phase filters before fetching", async () => {
    const { calls, service } = createService(careerFixture);

    await expect(service.getProfile({ personCode: "../013380" })).rejects.toBeInstanceOf(EuroleagueValidationError);
    await expect(
      service.getCareerStats({ personCode: "013380", phase: "../../injected" as unknown as PeoplePhaseType })
    ).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(0);
  });

  it("throws EuroleagueSchemaError on invalid rows", async () => {
    const { service } = createService({ data: [{ person: 42, type: "J" }] });

    await expect(service.getCareer({ personCode: "013380" })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueSchemaError when a single-row endpoint returns no rows", async () => {
    const { service } = createService({ data: [], total: 0 });

    await expect(service.getSeasonRegistration({ personCode: "013380", season: 2024 })).rejects.toBeInstanceOf(
      EuroleagueSchemaError
    );
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 404 }));
    const service = new PeopleService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.getProfile({ personCode: "013380" })).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createService(
  payload: unknown,
  competition: Competition = "euroleague"
): { calls: string[]; service: PeopleService } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    calls.push(String(input));

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return {
    calls,
    service: new PeopleService(new HttpClient({ competition, fetch }))
  };
}
