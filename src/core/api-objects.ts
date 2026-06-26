import * as z from "zod";

export const OptionalApiStringSchema = z.string().nullable().optional();
export const OptionalApiNumberSchema = z.number().nullable().optional();
export const OptionalApiBooleanSchema = z.boolean().nullable().optional();

export const ImagesSchema = z
  .object({
    action: OptionalApiStringSchema,
    crest: OptionalApiStringSchema,
    headshot: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const CountrySchema = z
  .object({
    code: z.string(),
    name: z.string()
  })
  .catchall(z.unknown());

export const ClubRefSchema = z
  .object({
    abbreviatedName: OptionalApiStringSchema,
    code: z.string(),
    editorialName: OptionalApiStringSchema,
    images: ImagesSchema.nullable().optional(),
    isVirtual: OptionalApiBooleanSchema,
    name: z.string(),
    tvCode: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const SeasonRefSchema = z
  .object({
    activationDate: OptionalApiStringSchema,
    alias: OptionalApiStringSchema,
    code: z.string(),
    competitionCode: OptionalApiStringSchema,
    endDate: OptionalApiStringSchema,
    name: z.string(),
    startDate: OptionalApiStringSchema,
    winner: ClubRefSchema.nullable().optional(),
    year: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

export const PersonSchema = z
  .object({
    abbreviatedName: OptionalApiStringSchema,
    alias: OptionalApiStringSchema,
    aliasRaw: OptionalApiStringSchema,
    birthCountry: CountrySchema.nullable().optional(),
    birthDate: OptionalApiStringSchema,
    code: z.string(),
    country: CountrySchema.nullable().optional(),
    facebookAccount: OptionalApiStringSchema,
    height: OptionalApiNumberSchema,
    images: ImagesSchema.nullable().optional(),
    instagramAccount: OptionalApiStringSchema,
    isReferee: OptionalApiBooleanSchema,
    jerseyName: OptionalApiStringSchema,
    name: z.string(),
    passportName: OptionalApiStringSchema,
    passportSurname: OptionalApiStringSchema,
    twitterAccount: OptionalApiStringSchema,
    weight: OptionalApiNumberSchema
  })
  .catchall(z.unknown());

/**
 * A person's club registration for a season. The same upstream shape backs both
 * a club roster member (`/clubs/{code}/people`) and a person's career rows
 * (`/people/{code}`), so both resources alias this single canonical schema.
 */
export const RegistrationSchema = z
  .object({
    active: OptionalApiBooleanSchema,
    club: ClubRefSchema,
    dorsal: OptionalApiStringSchema,
    dorsalRaw: OptionalApiStringSchema,
    endDate: OptionalApiStringSchema,
    externalId: OptionalApiNumberSchema,
    images: ImagesSchema.nullable().optional(),
    lastTeam: OptionalApiStringSchema,
    order: OptionalApiNumberSchema,
    person: PersonSchema,
    position: OptionalApiNumberSchema,
    positionName: OptionalApiStringSchema,
    season: SeasonRefSchema,
    startDate: OptionalApiStringSchema,
    type: z.string(),
    typeName: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export type Images = z.infer<typeof ImagesSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type ClubRef = z.infer<typeof ClubRefSchema>;
export type SeasonRef = z.infer<typeof SeasonRefSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Registration = z.infer<typeof RegistrationSchema>;
