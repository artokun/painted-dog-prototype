import { z } from "zod";

// Sorting and filtering enums
export enum SortBy {
  Title = "title",
  Author = "author",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

// Basic types that are still needed by the application
export type BookId = string;

export type LinkFields = {
  text: string;
  link: string;
  vendor: string;
};

// Contentful-based book schema (using the generated types as the source of truth)
export const ContentfulBookSizeSchema = z.enum(["XS", "SM", "MD", "LG", "XL"]);

export const ContentfulBookSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  featured: z.boolean().default(false),
  description: z.string().min(1, "Description is required"),
  publishDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Publish date must be in YYYY-MM-DD format"),
  bookSize: ContentfulBookSizeSchema,

  // Linked entries (transformed from Contentful references)
  authors: z.array(
    z.object({
      id: z.string(),
      fullName: z.string(),
      biography: z.string().optional(),
    })
  ),
  genre: z
    .object({
      id: z.string(),
      genre: z.string(),
      subGenre: z.string(),
    })
    .optional(),
  prices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        price: z.number(),
        description: z.string().optional(),
      })
    )
    .optional(),

  // Article and podcast links
  linkToFeaturedArticle: z
    .object({
      id: z.string(),
      text: z.string(),
      link: z.string(),
    })
    .optional(),
  linkToPodcastEpisode: z
    .object({
      id: z.string(),
      text: z.string(),
      link: z.string(),
    })
    .optional(),

  // Rich content sections
  criticalReceptionText: z.string().optional(),
  podcastText: z.string().optional(),

  // Textures for 3D models
  textures: z.object({
    front: z.string(), // Asset URL
    side: z.string(), // Asset URL
  }),

  offset: z.object({
    posX: z.number(),
    rotY: z.number(),
    posZ: z.number(),
  }),

  // For backward compatibility/3D rendering
  hidden: z.boolean().default(false),
});

// Export types
export type ContentfulBook = z.infer<typeof ContentfulBookSchema>;
export type Book = ContentfulBook; // Main type now points to Contentful
export type BookSize = z.infer<typeof ContentfulBookSizeSchema>;
export type BookMap = Record<BookId, Book>;

// Validation functions
export function validateContentfulBooks(data: unknown): ContentfulBook[] {
  return z.array(ContentfulBookSchema).parse(data);
}
