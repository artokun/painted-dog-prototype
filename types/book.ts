import { z } from "zod";

// Define the BookLink schema
export const BookLinkSchema = z.object({
  content: z.string().min(1, "Content is required"),
  href: z.string().min(1, "Href is required"),
  isExternal: z.boolean(),
});

// Define the book size options
export const BookSizeSchema = z.enum([
  "thin",
  "medium",
  "thick",
  "veryThick",
  "extraThick",
]);

export enum SortBy {
  Title = "title",
  Author = "author",
}
export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type BookId = string;

// Define the book schema
export const BookSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  size: BookSizeSchema,
  hidden: z.boolean().default(false),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  price: z.number().positive("Price must be positive"),
  description: z.string().min(1, "Description is required"),
  publishDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Publish date must be in YYYY-MM-DD format"),
  genre: z.string().min(1, "Genre is required"),
  isFeatured: z.boolean(),
  featuredArticle: BookLinkSchema.optional(),
  featuredPodcastEpisode: BookLinkSchema.optional(),
});

// Define the array schema
export const BooksArraySchema = z.array(BookSchema);

// Export types
export type BookLink = z.infer<typeof BookLinkSchema>;
export type Book = z.infer<typeof BookSchema>;
export type BookSize = z.infer<typeof BookSizeSchema>;
export type BooksArray = z.infer<typeof BooksArraySchema>;
export type BookMap = Record<BookId, Book>;

// Validation function
export function validateBooks(data: unknown): BooksArray {
  return BooksArraySchema.parse(data);
}

// Safe validation function that returns an error instead of throwing
export function validateBooksSafe(
  data: unknown
): { success: true; data: BooksArray } | { success: false; error: z.ZodError } {
  const result = BooksArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
