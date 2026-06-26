import * as z from "zod";

export const CompetitionInfoSchema = z
  .object({
    code: z.string(),
    name: z.string()
  })
  .catchall(z.unknown());

export type CompetitionInfo = z.infer<typeof CompetitionInfoSchema>;
