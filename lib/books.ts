import { Entry } from "contentful";
import { getEntries, getEntry } from "./contentful";
import { ContentfulBook } from "@/types/book";
import {
  Book,
  BookSkeleton,
  AuthorSkeleton,
  GenreSkeleton,
  PriceSkeleton,
  LinkSkeleton,
} from "@/types/contentful";

export type ContentfulBookEntry = Book;

// Transform Contentful entry to our Book type
export function transformContentfulBook(
  entry: ContentfulBookEntry
): ContentfulBook {
  const fields = entry.fields;

  return {
    id: entry.sys.id,
    title: fields.title,
    featured: fields.featured || false,
    description: fields.description,
    publishDate: fields.publishDate,
    bookSize: fields.bookSize as "XS" | "SM" | "MD" | "LG" | "XL",

    // Transform linked authors
    authors:
      fields.authors?.map((authorRef: Entry<AuthorSkeleton>) => ({
        id: authorRef.sys.id,
        fullName: authorRef.fields?.fullName || "Unknown Author",
        biography: authorRef.fields?.biography,
      })) || [],

    // Transform genre
    genre: fields.genre
      ? {
          id: fields.genre.sys.id,
          genre:
            (fields.genre as Entry<GenreSkeleton> | undefined)?.fields?.genre ||
            "Fiction",
          subGenre:
            (fields.genre as Entry<GenreSkeleton> | undefined)?.fields
              ?.subGenre || "Literary Fiction",
        }
      : undefined,

    // Transform prices
    prices:
      fields.prices?.map((priceRef: Entry<PriceSkeleton>) => ({
        id: priceRef.sys.id,
        text: priceRef.fields?.text || "Paperback",
        price: priceRef.fields?.price || 0,
        description: priceRef.fields?.description,
      })) || [],

    // Transform links
    linkToFeaturedArticle: fields.linkToFeaturedArticle
      ? {
          id: fields.linkToFeaturedArticle.sys.id,
          text:
            (fields.linkToFeaturedArticle as Entry<LinkSkeleton> | undefined)
              ?.fields?.text || "",
          link:
            (fields.linkToFeaturedArticle as Entry<LinkSkeleton> | undefined)
              ?.fields?.link || "",
        }
      : undefined,

    linkToPodcastEpisode: fields.linkToPodcastEpisode
      ? {
          id: fields.linkToPodcastEpisode.sys.id,
          text:
            (fields.linkToPodcastEpisode as Entry<LinkSkeleton> | undefined)
              ?.fields?.text || "",
          link:
            (fields.linkToPodcastEpisode as Entry<LinkSkeleton> | undefined)
              ?.fields?.link || "",
        }
      : undefined,

    // Rich content
    criticalReceptionText: fields.criticalReceptionText,
    podcastText: fields.podcastText,

    // For 3D rendering compatibility
    hidden: false,
    isFeatured: fields.featured || false,
  };
}

// Fetch all books from Contentful (server-side only)
export async function getAllBooks(): Promise<ContentfulBook[]> {
  if (typeof window !== "undefined") {
    throw new Error("getAllBooks should only be called server-side");
  }

  try {
    const response = await getEntries<Book>("book", {
      include: 3, // Include linked entries up to 3 levels deep
      order: "fields.publishDate", // Order by publish date
    });

    return response.items.map(transformContentfulBook);
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
    const response = await getEntry<Book>(id, { include: 3 });
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
    const response = await getEntries<Book>("book", {
      "fields.featured": true,
      include: 3,
      order: "fields.publishDate",
    });

    return response.items.map(transformContentfulBook);
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
