import * as z from "zod";

import {
  ClubRefSchema,
  CountrySchema,
  ImagesSchema,
  OptionalApiBooleanSchema,
  OptionalApiNumberSchema,
  OptionalApiStringSchema,
  PersonSchema,
  SeasonRefSchema
} from "../../core/api-objects";

export const ClubSchema = z
  .object({
    abbreviatedName: OptionalApiStringSchema,
    address: OptionalApiStringSchema,
    city: OptionalApiStringSchema,
    clubPermanentAlias: OptionalApiStringSchema,
    clubPermanentName: OptionalApiStringSchema,
    code: z.string(),
    country: CountrySchema.nullable().optional(),
    editorialName: OptionalApiStringSchema,
    images: ImagesSchema.nullable().optional(),
    isVirtual: OptionalApiBooleanSchema,
    name: z.string(),
    phone: OptionalApiStringSchema,
    president: OptionalApiStringSchema,
    sponsor: OptionalApiStringSchema,
    ticketsUrl: OptionalApiStringSchema,
    tvCode: OptionalApiStringSchema,
    twitterAccount: OptionalApiStringSchema,
    venueCode: OptionalApiStringSchema,
    website: OptionalApiStringSchema
  })
  .catchall(z.unknown());

export const ClubRosterMemberSchema = z
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

export type Club = z.infer<typeof ClubSchema>;
export type ClubRosterMember = z.infer<typeof ClubRosterMemberSchema>;
