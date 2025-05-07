import { z } from "zod";
import { paginationSchema, stringToNumber } from ".";

// Lat and lon can be string or number but if it's string, convert it to number
export const locationSchema = z.object({
  lat: z.string().transform((val) => {
    return typeof val === "string" ? stringToNumber(val, true) : val;
  }),
  lon: z.string().transform((val) => {
    return typeof val === "string" ? stringToNumber(val, true) : val;
  }),
});

export type LocationSchema = z.infer<typeof locationSchema>;

export const profileDataSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: locationSchema,
  skills: z.array(
    z.object({
      name: z.string().min(1, { message: "Skill name is required" }),
      experience: z.number().int().positive(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string().min(1, { message: "Company name is required" }),
      role: z.string().min(1, { message: "Role is required" }),
      years: z.number().positive(),
      description: z.string().optional(),
    })
  ),
  availableBy: z.string().date(),
});

export type ProfileDataSchema = z.infer<typeof profileDataSchema>;

export const profileFiltersSchema = z.object({
  skills: z.string().optional().default(""),
  skillsMinExp: z.string().optional().default(""),
  company: z.string().optional(),
  availableBy: z.string().date().optional(),
  location: z.string().optional(),
});

export const profileSearchSchema = profileFiltersSchema.merge(paginationSchema);

export type ProfileSearchSchema = z.infer<typeof profileSearchSchema>;
