import * as z from "zod";

import { NormalizedRecordSchema } from "../../core/schema";

export const ScheduleGameSchema = NormalizedRecordSchema;

export type ScheduleGame = z.infer<typeof ScheduleGameSchema>;
