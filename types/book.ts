import { z } from "zod";

// New Contentful-based types
export const ContentfulBookSizeSchema = z.enum(["XS", "SM", "MD", "LG", "XL"]);

export enum SortBy {
  Title = "title",
  Author = "author",
}
export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type BookId = string;

export type LinkFields = {
  text: string;
  link: string;
  vendor: string;
};

// Contentful-based book schema
export const ContentfulBookSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  featured: z.boolean().default(false),
  description: z.string().min(1, "Description is required"), // Rich markdown content
  publishDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Publish date must be in YYYY-MM-DD format"),
  bookSize: ContentfulBookSizeSchema, // XS/SM/MD/LG/XL from Contentful

  // Linked entries (from Contentful references)
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
      genre: z.string(), // "Fiction"
      subGenre: z.string(), // "Literary Fiction"
    })
    .optional(),
  prices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(), // "Paperback"
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

  // For backward compatibility/3D rendering
  hidden: z.boolean().default(false),
  isFeatured: z.boolean().default(false), // computed from featured field
});

// Export types
export type ContentfulBook = z.infer<typeof ContentfulBookSchema>;
export type Book = ContentfulBook; // Main type now points to Contentful
export type BookSize = z.infer<typeof ContentfulBookSizeSchema>;
export type BookMap = Record<BookId, Book>;

// Contentful validation functions
export function validateContentfulBooks(data: unknown): ContentfulBook[] {
  return z.array(ContentfulBookSchema).parse(data);
}
