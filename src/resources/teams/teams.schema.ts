import * as z from "zod";

import { NormalizedRowSchema } from "../../core/schema";

export const TeamStatSchema = NormalizedRowSchema;

export const TeamLeaderSchema = NormalizedRowSchema;

export type TeamStat = z.infer<typeof TeamStatSchema>;
export type TeamLeader = z.infer<typeof TeamLeaderSchema>;
