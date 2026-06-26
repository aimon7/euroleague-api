import { describe, expect, it } from "vitest";

import { EuroleagueValidationError } from "./errors";
import { ensureInteger, ensurePathSegment } from "./validation";

describe("ensureInteger", () => {
  it("returns finite integers unchanged", () => {
    expect(ensureInteger(1, "gameCode")).toBe(1);
    expect(ensureInteger(0, "round")).toBe(0);
  });

  it("rejects non-integers and non-finite values", () => {
    for (const value of [1.5, Number.NaN, Number.POSITIVE_INFINITY, "1" as unknown as number]) {
      expect(() => ensureInteger(value, "gameCode")).toThrow(EuroleagueValidationError);
    }
  });
});

describe("ensurePathSegment", () => {
  it("returns safe path segments unchanged", () => {
    expect(ensurePathSegment("013380", "personCode")).toBe("013380");
    expect(ensurePathSegment("OLY_2025-26", "clubCode")).toBe("OLY_2025-26");
  });

  it("rejects empty or unsafe path segments", () => {
    for (const value of ["", " ", "../OLY", "OLY/BAR", "OLY?x=1", "OLY.BAR", "\u039fLY"]) {
      expect(() => ensurePathSegment(value, "clubCode")).toThrow(EuroleagueValidationError);
    }
  });
});
