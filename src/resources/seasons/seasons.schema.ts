import * as z from "zod";

import { SeasonRefSchema } from "../../core/api-objects";

export const SeasonSchema = SeasonRefSchema;

export type Season = z.infer<typeof SeasonSchema>;
