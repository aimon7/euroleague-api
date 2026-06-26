import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import competitionFixture from "./__fixtures__/competition.json";
import competitionsFixture from "./__fixtures__/competitions.json";
import { CompetitionsService } from ".";

describe("CompetitionsService", () => {
  it("builds the bare catalog URL and unwraps the data envelope", async () => {
    const { calls, service } = createService(competitionsFixture);

    const competitions = await service.list();

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions");
    expect(competitions).toHaveLength(42);
    expect(competitions).toContainEqual({ code: "E", name: "Euroleague" });
    expect(competitions).toContainEqual({ code: "U", name: "Eurocup" });
  });

  it("builds the single-competition URL for euroleague", async () => {
    const { calls, service } = createService(competitionFixture);

    const competition = await service.get();

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E");
    expect(competition).toMatchObject({ code: "E", name: "Euroleague" });
  });

  it("uses the configured EuroCup competition code for get", async () => {
    const { calls, service } = createService({ code: "U", name: "Eurocup" }, "eurocup");

    await service.get();

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U");
  });

  it("throws EuroleagueSchemaError on invalid rows", async () => {
    const { service } = createService({ data: [{ code: 42 }] });

    await expect(service.list()).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 404 }));
    const service = new CompetitionsService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.list()).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createService(
  payload: unknown,
  competition: Competition = "euroleague"
): { calls: string[]; service: CompetitionsService } {
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
    service: new CompetitionsService(new HttpClient({ competition, fetch }))
  };
}
