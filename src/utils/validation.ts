import { z } from "zod";

export const validateDate = (dateString?: string) => {
  const date = z.string().date();

  const isValidDate = date.safeParse(dateString);

  return isValidDate.success ? dateString : null;
};
