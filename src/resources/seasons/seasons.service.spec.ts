import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import seasonFixture from "./__fixtures__/season.json";
import seasonsFixture from "./__fixtures__/seasons.json";
import { SeasonsService } from "./index";

describe("SeasonsService", () => {
  it("builds the seasons URL and parses nested season rows", async () => {
    const { calls, service } = createService(seasonsFixture);

    const seasons = await service.list();

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons");
    expect(seasons[0]).toMatchObject({
      code: "E2024",
      competitionCode: "E",
      winner: { code: "ULK", images: { crest: expect.any(String) } },
      year: 2024
    });
    expect(seasons[2]?.winner).toBeNull();
  });

  it("uses the configured EuroCup competition code", async () => {
    const { calls, service } = createService(seasonsFixture, "eurocup");

    await service.list();

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U/seasons");
  });

  it("throws EuroleagueSchemaError on invalid rows", async () => {
    const { service } = createService({ data: [42] });

    await expect(service.list()).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 404 }));
    const service = new SeasonsService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.list()).rejects.toBeInstanceOf(EuroleagueApiError);
  });

  it("builds the single-season URL and parses the record", async () => {
    const { calls, service } = createService(seasonFixture);

    const season = await service.get({ season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2025");
    expect(season).toMatchObject({
      alias: "2025-26",
      code: "E2025",
      competitionCode: "E",
      name: "EuroLeague 2025-26",
      winner: { code: "OLY", images: { crest: expect.any(String) } },
      year: 2025
    });
  });

  it("uses the configured EuroCup competition code for a single season", async () => {
    const { calls, service } = createService(seasonFixture, "eurocup");

    await service.get({ season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U/seasons/U2025");
  });

  it("throws EuroleagueSchemaError when the single-season payload is invalid", async () => {
    const { service } = createService({ code: "E2025" });

    await expect(service.get({ season: 2025 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });
});

function createService(
  payload: unknown,
  competition: Competition = "euroleague"
): { calls: string[]; service: SeasonsService } {
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
    service: new SeasonsService(new HttpClient({ competition, fetch }))
  };
}
