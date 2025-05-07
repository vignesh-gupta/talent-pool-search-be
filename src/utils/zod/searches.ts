import { z } from "zod";
import { paginationSchema } from ".";

export const searchDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
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

const searchFiltersSchema = z.object({
  q: z.string().optional(),
});


export const searchGetSchema = searchFiltersSchema.merge(paginationSchema)