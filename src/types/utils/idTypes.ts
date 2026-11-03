import { z } from "zod";

export const UUIDV4Schema = z.uuid({ version: "v4" }).brand<"UUIDV4">();
export type UUIDV4 = z.infer<typeof UUIDV4Schema>;
export function asUUID(str: string): UUIDV4 {
  const validationResult = UUIDV4Schema.safeParse(str);
  if (!validationResult.success) {
    throw new Error("Input is not a valid UUID");
  }
  return validationResult.data;
}