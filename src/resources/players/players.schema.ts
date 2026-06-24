import * as z from "zod";

import { normalizeApiRecord } from "../../core/normalize";

const RawApiRecordSchema = z.record(z.string(), z.unknown());

const NormalizedStatValueSchema = z.union([z.boolean(), z.number(), z.string(), z.null()]);

export const PlayerStatSchema = RawApiRecordSchema.transform((row) => normalizeApiRecord(row)).pipe(
  z.record(z.string(), NormalizedStatValueSchema)
);

export const PlayerLeaderSchema = RawApiRecordSchema.transform((row) => normalizeApiRecord(row)).pipe(
  z.record(z.string(), NormalizedStatValueSchema)
);

export type PlayerStat = z.infer<typeof PlayerStatSchema>;
export type PlayerLeader = z.infer<typeof PlayerLeaderSchema>;
