import type { Entry } from "contentful";
import { getEntries, getEntry } from "./contentful";
import { ContentfulBook } from "@/types/book";
import { TypeBook, TypeGenreSkeleton, TypeLinkSkeleton } from "@/types";

export type ContentfulBookEntry = TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">;

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

  return {
    id: entry.sys.id,
    title: getLocalizedField(fields.title) || "",
    featured: getLocalizedField(fields.featured) || false,
    description: getLocalizedField(fields.description) || "",
    publishDate: getLocalizedField(fields.publishDate) || "",
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
          }))
      : [],

    // Transform links
    linkToFeaturedArticle:
      fields.linkToFeaturedArticle &&
      "sys" in fields.linkToFeaturedArticle &&
      "fields" in fields.linkToFeaturedArticle
        ? {
            id: fields.linkToFeaturedArticle.sys.id || "",
            text:
              getLocalizedField(
                (fields.linkToFeaturedArticle as Entry<TypeLinkSkeleton>).fields
                  .text
              ) || "",
            link:
              getLocalizedField(
                (fields.linkToFeaturedArticle as Entry<TypeLinkSkeleton>).fields
                  .link
              ) || "",
          }
        : undefined,

    linkToPodcastEpisode:
      fields.linkToPodcastEpisode &&
      "sys" in fields.linkToPodcastEpisode &&
      "fields" in fields.linkToPodcastEpisode
        ? {
            id: fields.linkToPodcastEpisode.sys.id || "",
            text:
              getLocalizedField(
                (fields.linkToPodcastEpisode as Entry<TypeLinkSkeleton>).fields
                  .text
              ) || "",
            link:
              getLocalizedField(
                (fields.linkToPodcastEpisode as Entry<TypeLinkSkeleton>).fields
                  .link
              ) || "",
          }
        : undefined,

    // Rich content
    criticalReceptionText: getLocalizedField(fields.criticalReceptionText),
    podcastText: getLocalizedField(fields.podcastText),

    // Transform textures (using individual texture fields for now)
    textures: {
      front:
        fields.bookCoverTextureFront &&
        "fields" in fields.bookCoverTextureFront &&
        fields.bookCoverTextureFront.fields?.file?.url
          ? getLocalizedField(fields.bookCoverTextureFront.fields.file.url) ||
            ""
          : "",
      side:
        fields.bookCoverTextureSide &&
        "fields" in fields.bookCoverTextureSide &&
        fields.bookCoverTextureSide.fields?.file?.url
          ? getLocalizedField(fields.bookCoverTextureSide.fields.file.url) || ""
          : "",
    },

    // For 3D rendering compatibility
    hidden: false,
    isFeatured: getLocalizedField(fields.featured) || false,
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
