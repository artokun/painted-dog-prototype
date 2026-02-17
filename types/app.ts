import { JsonObject, JsonArray } from "type-fest";
// Application types for the painted-dog book catalog
export type BookId = string;

export interface Author {
  id: string;
  fullName: string;
  biography?: string;
}

export interface Genre {
  id: string;
  genre: string;
  subGenre: string;
}

export interface Price {
  id: string;
  text: string;
  price: number;
  description?: string;
  productInformation?: JsonObject | JsonArray | null;
}

export interface Link {
  id: string;
  text: string;
  link: string;
}

export interface Review {
  id: string;
  title: string;
  excerpt: string;
  criticName: string;
  publishDate: string;
  externalLink: string;
  isFeatured: boolean;
}

export interface Asset {
  id: string;
  url: string;
  title: string;
  description: string;
  contentType: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  excerpt: string;
  hostName: string;
  publishDate: string;
  externalLink: string;
  isFeatured: boolean;
}

export interface ContentfulBook {
  id: BookId;
  title: string;
  isbn: string;
  slug: string;
  featured: boolean;
  excerpt?: Asset;
  description: string;
  publishDate: string;
  offset: {
    posX: number;
    rotY: number;
    posZ: number;
  };
  bookSize: "XS" | "SM" | "MD" | "LG" | "XL" | "280x260";
  authors: Author[];
  genre?: Genre;
  prices: Price[];
  reviews: Review[];
  podcastEpisodes: PodcastEpisode[];
  bookTexture?: string;
  hidden: boolean;
}

// Alias for backward compatibility
export type Book = ContentfulBook;

export type BookMap = Record<BookId, ContentfulBook>;

// Filter and sort types
export enum SortBy {
  Title = "title",
  Author = "author",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}
