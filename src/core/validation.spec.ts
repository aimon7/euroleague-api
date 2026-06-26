import { describe, expect, it } from "vitest";

import { EuroleagueValidationError } from "./errors";
import { ensurePathSegment } from "./validation";

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
