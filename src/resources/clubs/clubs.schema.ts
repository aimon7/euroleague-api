import * as z from "zod";

import {
  CountrySchema,
  ImagesSchema,
  OptionalApiBooleanSchema,
  OptionalApiStringSchema,
  type Registration,
  RegistrationSchema
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

export const ClubRosterMemberSchema = RegistrationSchema;

export type Club = z.infer<typeof ClubSchema>;
export type ClubRosterMember = Registration;
