import type { Entry } from "contentful";
import { getEntries, getEntry } from "./contentful";
import { ContentfulBook } from "@/types/app";
import type { JsonObject, JsonArray } from "type-fest";
import { TypeBook, TypeGenreSkeleton, TypeLinkSkeleton } from "@/types";

export type ContentfulBookEntry = TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">;

// Helper function to slugify a string for URL-safe usage
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Helper function to get localized field value
function getLocalizedField<T>(field: T | { [locale: string]: T }): T {
  if (field === null || field === undefined) {
    return field as T;
  }

  if (
    typeof field === "object" &&
    field !== null &&
    !Array.isArray(field) &&
    "sys" in field
  ) {
    // It's a linked entry or asset, return as-is
    return field as T;
  }

  if (typeof field === "object" && field !== null && !Array.isArray(field)) {
    // It's a localized field object
    const localizedField = field as { [locale: string]: T };
    // Try to get en-US first, then any available locale
    return (
      localizedField["en-US"] ||
      localizedField[Object.keys(localizedField)[0]] ||
      (undefined as T)
    );
  }

  // It's a direct value
  return field as T;
}

// Transform Contentful entry to our TypeBook type
export function transformContentfulBook(
  entry: TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">
): ContentfulBook {
  const fields = entry.fields;

  const title = getLocalizedField(fields.title) || "";

  return {
    id: entry.sys.id,
    title,
    isbn: getLocalizedField(fields.isbn) || "",
    slug: slugify(title),
    featured: getLocalizedField(fields.featured) || false,
    description: getLocalizedField(fields.description) || "",
    publishDate: getLocalizedField(fields.publishDate) || "",
    offset: {
      posX: Math.random() * 0.014 - 0.007,
      rotY: Math.random() * 0.014 - 0.007,
      posZ: Math.random() * 0.014 - 0.007,
    },
    bookSize: (getLocalizedField(fields.bookSize) || "MD") as
      | "XS"
      | "SM"
      | "MD"
      | "LG"
      | "XL",

    // Transform linked authors
    authors: Array.isArray(fields.authors)
      ? fields.authors
          .filter(
            (authorRef) =>
              authorRef != null &&
              typeof authorRef === "object" &&
              "sys" in authorRef &&
              "fields" in authorRef
          )
          .map((authorRef) => ({
            id: authorRef.sys.id,
            fullName:
              getLocalizedField(authorRef.fields.fullName) || "Unknown Author",
            biography: getLocalizedField(authorRef.fields.biography),
          }))
      : [],

    // Transform excerpt
    excerpt:
      fields.excerpt && "sys" in fields.excerpt && "fields" in fields.excerpt
        ? {
            id: fields.excerpt.sys.id,
            url: getLocalizedField(fields.excerpt.fields.file?.url) || "",
            title: getLocalizedField(fields.excerpt.fields.title) || "",
            description:
              getLocalizedField(fields.excerpt.fields.description) || "",
            contentType:
              getLocalizedField(fields.excerpt.fields.file?.contentType) || "",
          }
        : undefined,

    // Transform genre
    genre:
      fields.genre && "sys" in fields.genre && "fields" in fields.genre
        ? {
            id: fields.genre.sys.id || "",
            genre:
              getLocalizedField(
                (fields.genre as Entry<TypeGenreSkeleton>).fields.genre
              ) || "Fiction",
            subGenre:
              getLocalizedField(
                (fields.genre as Entry<TypeGenreSkeleton>).fields.subGenre
              ) || "Literary Fiction",
          }
        : undefined,

    // Transform prices
    prices: Array.isArray(fields.prices)
      ? fields.prices
          .filter(
            (priceRef) =>
              priceRef != null &&
              typeof priceRef === "object" &&
              "sys" in priceRef &&
              "fields" in priceRef
          )
          .map((priceRef) => ({
            id: priceRef.sys.id,
            text: getLocalizedField(priceRef.fields.text) || "Paperback",
            price: getLocalizedField(priceRef.fields.price) || 0,
            description: getLocalizedField(priceRef.fields.description),
            productInformation: priceRef.fields.productInformation as
              | JsonObject
              | JsonArray
              | null
              | undefined,
          }))
      : [],

    // Transform reviews and find featured one
    reviews: Array.isArray(fields.reviews)
      ? fields.reviews
          .filter(
            (reviewRef) =>
              reviewRef != null &&
              typeof reviewRef === "object" &&
              "sys" in reviewRef &&
              "fields" in reviewRef
          )
          .map((reviewRef) => ({
            id: reviewRef.sys.id,
            title: getLocalizedField(reviewRef.fields.title) || "",
            excerpt: getLocalizedField(reviewRef.fields.excerpt) || "",
            criticName: getLocalizedField(reviewRef.fields.criticName) || "",
            publishDate: getLocalizedField(reviewRef.fields.publishDate) || "",
            externalLink:
              getLocalizedField(reviewRef.fields.externalLink) || "",
            isFeatured: getLocalizedField(reviewRef.fields.isFeatured) || false,
          }))
      : [],

    // Transform podcast episodes and find featured one
    podcastEpisodes: Array.isArray(fields.podcastEpisodes)
      ? fields.podcastEpisodes
          .filter(
            (episodeRef) =>
              episodeRef != null &&
              typeof episodeRef === "object" &&
              "sys" in episodeRef &&
              "fields" in episodeRef
          )
          .map((episodeRef) => ({
            id: episodeRef.sys.id,
            title: getLocalizedField(episodeRef.fields.title) || "",
            excerpt: getLocalizedField(episodeRef.fields.excerpt) || "",
            hostName: getLocalizedField(episodeRef.fields.hostName) || "",
            publishDate: getLocalizedField(episodeRef.fields.publishDate) || "",
            externalLink:
              getLocalizedField(episodeRef.fields.externalLink) || "",
            isFeatured:
              getLocalizedField(episodeRef.fields.isFeatured) || false,
          }))
      : [],

    // Rich content
    // criticalReceptionText: getLocalizedField(fields.criticalReceptionText),
    // podcastText: getLocalizedField(fields.podcastText),

    // Transform unified texture (fallback to GLB embedded if not provided)
    bookTexture:
      fields.bookTexture &&
      "fields" in fields.bookTexture &&
      fields.bookTexture.fields?.file?.url
        ? (() => {
            const url = getLocalizedField(fields.bookTexture.fields.file.url);
            // Ensure URL has protocol (Contentful sometimes returns protocol-relative URLs)
            return url
              ? url.startsWith("//")
                ? `https:${url}`
                : url
              : undefined;
          })()
        : undefined,

    // For 3D rendering compatibility
    hidden: false,
  };
}

// Fetch all books from Contentful (server-side only)
export async function getAllBooks(): Promise<ContentfulBook[]> {
  if (typeof window !== "undefined") {
    throw new Error("getAllBooks should only be called server-side");
  }

  try {
    const response = await getEntries<TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">>(
      "book",
      {
        include: 3, // Include linked entries up to 3 levels deep
        order: "fields.publishDate", // Order by publish date
      }
    );

    return response.items.map((item) =>
      transformContentfulBook(item as unknown as ContentfulBookEntry)
    );
  } catch (error) {
    console.error("Error fetching books from Contentful:", error);
    return [];
  }
}

// Fetch a single book by ID (server-side only)
export async function getBookById(id: string): Promise<ContentfulBook | null> {
  if (typeof window !== "undefined") {
    throw new Error("getBookById should only be called server-side");
  }

  try {
    const response = await getEntry<TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">>(
      id,
      { include: 3 }
    );
    return transformContentfulBook(response as unknown as ContentfulBookEntry);
  } catch (error) {
    console.error(`Error fetching book ${id} from Contentful:`, error);
    return null;
  }
}

// Fetch a single book by slug (server-side only)
export async function getBookBySlug(
  slug: string
): Promise<ContentfulBook | null> {
  if (typeof window !== "undefined") {
    throw new Error("getBookBySlug should only be called server-side");
  }

  try {
    // Get all books and find the one with matching slug
    const books = await getAllBooks();
    return books.find((book) => book.slug === slug) || null;
  } catch (error) {
    console.error(
      `Error fetching book with slug ${slug} from Contentful:`,
      error
    );
    return null;
  }
}

// Fetch featured books (server-side only)
export async function getFeaturedBooks(): Promise<ContentfulBook[]> {
  if (typeof window !== "undefined") {
    throw new Error("getFeaturedBooks should only be called server-side");
  }

  try {
    const response = await getEntries<TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">>(
      "book",
      {
        "fields.featured": true,
        include: 3,
        order: "fields.publishDate",
      }
    );

    return response.items.map((item) =>
      transformContentfulBook(item as unknown as ContentfulBookEntry)
    );
  } catch (error) {
    console.error("Error fetching featured books from Contentful:", error);
    return [];
  }
}

// Convert book data to the map format expected by the store
export function booksArrayToMap(
  books: ContentfulBook[]
): Record<string, ContentfulBook> {
  return books.reduce(
    (map, book) => {
      map[book.id] = book;
      return map;
    },
    {} as Record<string, ContentfulBook>
  );
}
