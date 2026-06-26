import { describe, expect, it } from "vitest";

import { ClubRefSchema, CountrySchema, ImagesSchema, PersonSchema, SeasonRefSchema } from "./api-objects";

describe("shared API object schemas", () => {
  it("parses images and preserves unknown upstream fields", () => {
    const images = ImagesSchema.parse({
      crest: "https://example.test/crest.png",
      headshot: "https://example.test/headshot.png",
      custom: 42
    });

    expect(images).toEqual({
      crest: "https://example.test/crest.png",
      headshot: "https://example.test/headshot.png",
      custom: 42
    });
  });

  it("parses country references without normalizing string codes", () => {
    const country = CountrySchema.parse({ code: "FRA", name: "France", regionCode: "001" });

    expect(country.code).toBe("FRA");
    expect(country.regionCode).toBe("001");
  });

  it("parses club references while preserving leading-zero codes", () => {
    const club = ClubRefSchema.parse({
      code: "001",
      name: "Test Club",
      abbreviatedName: "Test",
      editorialName: "Test Club",
      tvCode: "007",
      isVirtual: false,
      images: { crest: "https://example.test/crest.png" },
      externalId: 123
    });

    expect(club).toMatchObject({
      code: "001",
      tvCode: "007",
      externalId: 123
    });
  });

  it("parses season references and nested winner clubs", () => {
    const season = SeasonRefSchema.parse({
      name: "EuroLeague 2025-26",
      code: "E2025",
      alias: "2025-26",
      competitionCode: "E",
      year: 2025,
      startDate: "2025-07-01T00:00:00",
      winner: {
        code: "OLY",
        name: "Olympiacos Piraeus",
        tvCode: "OLY",
        images: { crest: "https://example.test/crest.png" }
      }
    });

    expect(season.code).toBe("E2025");
    expect(season.winner?.code).toBe("OLY");
  });

  it("parses people while preserving numeric-looking person codes", () => {
    const person = PersonSchema.parse({
      code: "013380",
      name: "FOURNIER, EVAN",
      alias: "FOURNIER, EVAN",
      country: { code: "FRA", name: "France" },
      height: 200,
      weight: 92,
      birthDate: "1992-10-29T00:00:00",
      birthCountry: { code: "SUI", name: "Switzerland" },
      isReferee: false,
      images: {},
      externalId: 53153
    });

    expect(person.code).toBe("013380");
    expect(person.externalId).toBe(53153);
  });

  it("rejects numeric codes instead of coercing them", () => {
    expect(() => ClubRefSchema.parse({ code: 1, name: "Test Club" })).toThrow();
    expect(() => PersonSchema.parse({ code: 13380, name: "FOURNIER, EVAN" })).toThrow();
  });
});
