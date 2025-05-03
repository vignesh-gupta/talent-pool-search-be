import { z, ZodError } from "zod";

export const profileSearchSchema = z.object({
  skills: z.string().optional(),
  skillsMinExp: z.string().optional(),
  company: z.string().optional(),
  availableBy: z.string().date().optional(),
  location: z.string().optional(),
  page: z
    .string()
    .transform((val) => {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new ZodError([
          {
            message: "Invalid page number",
            code: "invalid_type",
            path: ["page"],
            expected: "number",
            received: "nan",
          }
        ]);
      }
      return num;
    })
    .default("1"), // Default as string, will be transformed to number
  limit: z
    .string()
    .transform((val) => {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new ZodError([
          {
            message: "Invalid per page limit",
            code: "invalid_type",
            path: ["limit"],
            expected: "number",
            received: "nan",
          }
        ]);
      }
      return num;
    })
    .default("5"), // Default as string, will be transformed to number
});
