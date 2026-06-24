import * as z from "zod";

import { normalizeApiRecord, normalizeApiRecordDeep } from "./normalize";

const RawApiRecordSchema = z.record(z.string(), z.unknown());

const NormalizedStatValueSchema = z.union([z.boolean(), z.number(), z.string(), z.null()]);

export const NormalizedRowSchema = RawApiRecordSchema.transform((row) => normalizeApiRecord(row)).pipe(
  z.record(z.string(), NormalizedStatValueSchema)
);

export const NormalizedRecordSchema = RawApiRecordSchema.transform((row) => normalizeApiRecordDeep(row));

export type NormalizedRow = z.infer<typeof NormalizedRowSchema>;
export type NormalizedDeepRecord = z.infer<typeof NormalizedRecordSchema>;
