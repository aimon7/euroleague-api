import * as z from "zod";

import { NormalizedRowSchema } from "../../core/schema";

export const StandingSchema = NormalizedRowSchema;

export type Standing = z.infer<typeof StandingSchema>;
