import { z, ZodError } from "zod";

const stringToNumber = (val: string, isFloat?: boolean) => {
  const num = isFloat ? parseFloat(val) : parseInt(val);
  if (isNaN(num)) {
    throw new ZodError([
      {
        message: `Invalid ${isFloat ? "number" : "integer"}`,
        code: "invalid_type",
        expected: isFloat ? "number" : "integer",
        received: typeof val,
        path: [],
      },
    ]);
  }
  return num;
};

// Lat and Lng can be string or number but if it's string, convert it to number
export const locationSchema = z.object({
  lat: z.union([z.string(), z.number()]).transform((val) => {
    return typeof val === "string" ? stringToNumber(val, true) : val;
  }),
  lng: z.union([z.string(), z.number()]).transform((val) => {
    return typeof val === "string" ? stringToNumber(val, true) : val;
  }),
});

export type LocationSchema = z.infer<typeof locationSchema>;

export const profileDataSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location:locationSchema,
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
  availableBy: z.string().date()
});

export type ProfileDataSchema = z.infer<typeof profileDataSchema>;

export const profileSearchSchema = z.object({
  skills: z.string().optional().default(""),
  skillsMinExp: z.string().optional().default(""),
  company: z.string().optional(),
  availableBy: z.string().date().optional(),
  location: z.string().optional(),
  page: z
    .string()
    .transform((val) => stringToNumber(val))
    .refine((val) => val > 0, {
      message: "Page number must be greater than 0",
    })
    .default("1"), // Default as string, will be transformed to number
  limit: z
    .string()
    .transform((val) => stringToNumber(val))
    .refine((val) => val > 0, {
      message: "Per page limit must be greater than 0",
    })
    .default("50"), // Default as string, will be transformed to number
});

export type ProfileSearchSchema = z.infer<typeof profileSearchSchema>;
