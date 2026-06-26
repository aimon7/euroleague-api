import * as z from "zod";

import { NormalizedRowSchema } from "../../core/schema";

export const TeamStatSchema = NormalizedRowSchema;

export type TeamStat = z.infer<typeof TeamStatSchema>;

// Leaders are derived from the same v3 statistics rows (the dedicated /leaders
// endpoint is gone), so a leader row is shaped exactly like a stat row.
export type TeamLeader = TeamStat;
