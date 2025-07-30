import { z } from "zod";

// Define the book size options
export const BookSizeSchema = z.enum([
  "thin",
  "medium",
  "thick",
  "veryThick",
  "extraThick",
]);

// Define the book schema
export const BookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  size: BookSizeSchema,
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
});

// Define the array schema
export const BooksArraySchema = z.array(BookSchema);

// Export types
export type Book = z.infer<typeof BookSchema>;
export type BookSize = z.infer<typeof BookSizeSchema>;
export type BooksArray = z.infer<typeof BooksArraySchema>;

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
