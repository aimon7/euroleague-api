import * as z from "zod";

import { NormalizedRowSchema } from "../../core/schema";

export const ShotEventSchema = NormalizedRowSchema;

export type ShotEvent = z.infer<typeof ShotEventSchema>;
