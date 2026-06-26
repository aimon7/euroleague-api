import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError, EuroleagueValidationError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import roundFixture from "./__fixtures__/round.json";
import roundsFixture from "./__fixtures__/rounds.json";
import { RoundsService } from ".";

describe("RoundsService", () => {
  it("builds the rounds list URL and unwraps the data envelope", async () => {
    const { calls, service } = createService(roundsFixture);

    const rounds = await service.list({ season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2025/rounds");
    expect(rounds).toHaveLength(47);
    expect(rounds[0]).toMatchObject({
      name: "Final",
      phaseTypeCode: "FF",
      round: 47,
      seasonCode: "E2025"
    });
  });

  it("builds the round detail URL for eurocup", async () => {
    const { calls, service } = createService(roundFixture, "eurocup");

    const round = await service.get({ round: 1, season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U/seasons/U2025/rounds/1");
    expect(round).toMatchObject({
      datesFormmated: "Jul 17 - Oct 01, 2025",
      name: "Round 1",
      phaseTypeCode: "RS",
      round: 1,
      seasonCode: "E2025"
    });
  });

  it("rejects non-integer round numbers before making a request", async () => {
    const { calls, service } = createService(roundFixture);

    await expect(service.get({ round: 1.5, season: 2025 })).rejects.toBeInstanceOf(EuroleagueValidationError);
    await expect(service.get({ round: "1/../../injected" as unknown as number, season: 2025 })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
    expect(calls).toHaveLength(0);
  });

  it("throws EuroleagueSchemaError on invalid round rows", async () => {
    const { service } = createService({ data: [{ name: "Broken Round", round: "not-a-number" }] });

    await expect(service.list({ season: 2025 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("missing", { status: 404 }));
    const service = new RoundsService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.list({ season: 2025 })).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createService(
  payload: unknown,
  competition: Competition = "euroleague"
): { calls: string[]; service: RoundsService } {
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
    service: new RoundsService(new HttpClient({ competition, fetch }))
  };
}
