import * as z from "zod";

import { NormalizedRowSchema } from "../../core/schema";

export const PlayerStatSchema = NormalizedRowSchema;

export const PlayerLeaderSchema = NormalizedRowSchema;

export type PlayerStat = z.infer<typeof PlayerStatSchema>;
export type PlayerLeader = z.infer<typeof PlayerLeaderSchema>;
