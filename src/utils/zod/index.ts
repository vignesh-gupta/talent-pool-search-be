import { z, ZodError } from "zod";

export const stringToNumber = (val: string, isFloat?: boolean) => {
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

export const IdSchema = z.object({
  id: z.string().length(24, { message: "Invalid profile ID" }),
});

export const paginationSchema = z.object({
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
