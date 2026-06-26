import { describe, expect, it, vi } from "vitest";

import type { Competition } from "../../core/config";
import { EuroleagueApiError, EuroleagueSchemaError, EuroleagueValidationError } from "../../core/errors";
import { HttpClient } from "../../core/http-client";

import phaseFixture from "./__fixtures__/phase.json";
import phasesFixture from "./__fixtures__/phases.json";
import { PhasesService } from ".";

describe("PhasesService", () => {
  it("builds the phases list URL and parses phases", async () => {
    const { calls, service } = createService(phasesFixture, "euroleague");

    const phases = await service.list({ season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2025/phases");
    expect(phases).toHaveLength(4);
    expect(phases[0]).toMatchObject({
      order: 4,
      phaseType: {
        code: "FF",
        isGroupPhase: false,
        name: "Final Four"
      },
      season: {
        code: "E2025",
        competitionCode: "E",
        year: 2025
      }
    });
  });

  it("builds the phase detail URL for eurocup", async () => {
    const { calls, service } = createService(phaseFixture, "eurocup");

    const phase = await service.get({ phase: "RS", season: 2022 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/U/seasons/U2022/phases/RS");
    expect(phase).toMatchObject({
      order: 1,
      phaseType: {
        code: "RS",
        isGroupPhase: true,
        name: "Regular Season"
      }
    });
  });

  it("rejects injected phase codes before making a request", async () => {
    const { calls, service } = createService(phaseFixture, "euroleague");

    await expect(service.get({ phase: "../injected", season: 2025 })).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(0);
  });

  it("throws EuroleagueSchemaError on invalid phase rows", async () => {
    const { service } = createService([{ phaseType: { code: 42 } }], "euroleague");

    await expect(service.list({ season: 2025 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("missing", { status: 404 }));
    const service = new PhasesService(new HttpClient({ competition: "euroleague", fetch }));

    await expect(service.list({ season: 2025 })).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createService(payload: unknown, competition: Competition): { calls: string[]; service: PhasesService } {
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
    service: new PhasesService(new HttpClient({ competition, fetch }))
  };
}
