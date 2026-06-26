import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueSchemaError, EuroleagueValidationError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import clubFixture from "./__fixtures__/club.json";
import rosterFixture from "./__fixtures__/club-roster.json";
import clubsFixture from "./__fixtures__/clubs.json";
import { ClubsService } from ".";

describe("ClubsService", () => {
  it("builds the clubs list URL and parses clubs", async () => {
    const { calls, service } = createService(clubsFixture, "euroleague");

    const clubs = await service.list({ season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2023/clubs");
    expect(clubs).toHaveLength(2);
    expect(clubs[0]).toMatchObject({
      code: "BER",
      country: {
        code: "GER",
        name: "Germany"
      },
      name: "ALBA Berlin"
    });
  });

  it("builds the club detail URL for eurocup", async () => {
    const { calls, service } = createService(clubFixture, "eurocup");

    const club = await service.get({ clubCode: "OLY", season: 2022 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U/seasons/U2022/clubs/OLY");
    expect(club).toMatchObject({
      code: "OLY",
      name: "Olympiacos Piraeus",
      venueCode: "ASF"
    });
  });

  it("builds the roster URL and preserves string person codes", async () => {
    const { calls, service } = createService(rosterFixture, "euroleague");

    const roster = await service.getRoster({ clubCode: "OLY", season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v2/competitions/E/seasons/E2023/clubs/OLY/people"
    );
    expect(roster[0]).toMatchObject({
      club: {
        code: "OLY"
      },
      dorsal: "2",
      person: {
        code: "012878"
      },
      season: {
        code: "E2023"
      },
      typeName: "Player"
    });
  });

  it("builds the wapi logo URL and returns the logo path string", async () => {
    const { calls, service } = createService("/Content/img/team-logos/EL/MAD.png", "euroleague");

    const logo = await service.getLogo({ clubCode: "MAD", season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/wapi/Team");
    expect(url.searchParams.get("code")).toBe("MAD");
    expect(url.searchParams.get("season")).toBe("E2025");
    expect(logo).toBe("/Content/img/team-logos/EL/MAD.png");
  });

  it("rejects injected club codes before making a request", async () => {
    const { calls, service } = createService(clubFixture, "euroleague");

    await expect(service.get({ clubCode: "../injected", season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
    await expect(service.getRoster({ clubCode: "OLY/../../injected", season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
    expect(calls).toHaveLength(0);
  });

  it("throws EuroleagueSchemaError on invalid club rows", async () => {
    const { service } = createService({ data: [{ code: 42, name: "Broken Club" }] }, "euroleague");

    await expect(service.list({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("missing", { status: 404 }));
    const service = new ClubsService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.list({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createService(
  payload: unknown,
  competition: "euroleague" | "eurocup"
): { calls: string[]; service: ClubsService } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    calls.push(String(input));

    return new Response(JSON.stringify(payload), {
      headers: {
        "content-type": "application/json"
      },
      status: 200
    });
  });

  return {
    calls,
    service: new ClubsService(new HttpClient({ competition, fetch }))
  };
}
