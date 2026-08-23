import { z } from "zod";

const MAX_NAME_LENGTH = 100;
const MAX_THUMBNAIL_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates the raw inputs of the create/edit Album modal before they are
 * written to the database. The thumbnail is optional; when present it must be
 * an image under the size cap.
 */
export const albumFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Album name is required")
    .max(MAX_NAME_LENGTH, `Album name must be ${MAX_NAME_LENGTH} characters or fewer`),
  thumbnail: z
    .instanceof(File)
    .refine(
      (file) => file.type.startsWith("image/"),
      "Thumbnail must be an image file",
    )
    .refine(
      (file) => file.size <= MAX_THUMBNAIL_BYTES,
      "Thumbnail must be smaller than 10 MB",
    )
    .nullable()
    .optional(),
});

export type AlbumFormInput = z.infer<typeof albumFormSchema>;
