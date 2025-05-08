import { z } from "zod";
import { paginationSchema } from ".";

export const searchDataSchema = z.object({
  title: z.string().optional(),
  location: z.string().optional(),
  skills: z
    .array(
      z.object({
        name: z.string().min(1, "Skill name is required"),
        experience: z.number().optional().default(0),
      })
    )
    .optional(),
  company: z.string().optional(),
  availableBy: z.date().optional(),
});

export type SearchDataType = z.infer<typeof searchDataSchema>;

const searchFiltersSchema = z.object({
  q: z.string().optional(),
});


export const searchGetSchema = searchFiltersSchema.merge(paginationSchema)