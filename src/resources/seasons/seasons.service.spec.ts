import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

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
