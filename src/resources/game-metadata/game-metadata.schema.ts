import * as z from "zod";

import { NormalizedRecordSchema } from "../../core/schema";

export const GameMetadataSchema = NormalizedRecordSchema;

export type GameMetadata = z.infer<typeof GameMetadataSchema>;
