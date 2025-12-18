import { z } from "zod/v4";

/**
 * Schema for a single track in a submission.
 */
export const trackSchema = z.object({
  storage_path: z.string().min(1, "Storage path is required"),
  filename: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  size_bytes: z.number().int().positive().nullable().optional(),
  title: z.string().min(1, "Track title is required"),
  genre: z.string().nullable().optional(),
  bpm: z.number().int().min(1).max(300).nullable().optional(),
  key: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for artist information.
 */
export const artistSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  email: z.email("Valid email is required"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        // Remove common formatting characters
        const cleaned = val.replace(/[\s()-]/g, "");
        // Check if it's a valid phone number (10-15 digits, optionally starting with +)
        return /^\+?\d{10,15}$/.test(cleaned);
      },
      { message: "Invalid phone number format" },
    ),
  bio: z.string().nullable().optional(),
  instagram_url: z.url().nullable().optional().or(z.literal("")),
  soundcloud_url: z.url().nullable().optional().or(z.literal("")),
  spotify_url: z.url().nullable().optional().or(z.literal("")),
});

/**
 * Schema for creating a new submission (POST /api/submissions).
 */
export const createSubmissionSchema = z.object({
  artist: artistSchema,
  tracks: z.array(trackSchema).min(1, "At least one track is required"),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type ArtistInput = z.infer<typeof artistSchema>;
export type TrackInput = z.infer<typeof trackSchema>;
