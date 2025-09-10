// Auto-generated Contentful types
// Generated on 2025-09-09T23:36:37.752Z
import { Asset, Entry } from 'contentful'

// Book
// Individual book information
export interface BookFields {
  /** Title */
  title: string
  /** Featured Book? */
  featured?: boolean
  /** Description */
  description: string
  /** Authors */
  authors: Entry<AuthorFields>[]
  /** Publish Date */
  publishDate: string
  /** Genre */
  genre?: Entry<GenreFields>
  /** Prices */
  prices: Entry<PriceFields>[]
  /** Book Size */
  bookSize: string
  /** Book Cover Front Texture */
  bookCoverTextureFront: Asset
  /** Book Cover Side Texture */
  bookCoverTextureSide: Asset
  /** Link to Featured Article */
  linkToFeaturedArticle?: Entry<LinkFields>
  /** Link to Podcast Episode */
  linkToPodcastEpisode?: Entry<LinkFields>
  /** Critical Reception Text */
  criticalReceptionText: string
  /** Podcast Text */
  podcastText?: string
  /** Podcast Links */
  podcastLinks?: Entry<LinkFields>[]
  /** Excerpt PDF */
  excerpt?: Asset
}

export type Book = Entry<BookFields>

// Price + Product Information
// Used for showing multiple prices along with their product information
export interface PriceFields {
  /** Text */
  text: string
  /** Price */
  price?: number
  /** Is New? */
  isNew?: boolean
  /** Description */
  description: string
  /** Product Information */
  productInformation?: any
}

export type Price = Entry<PriceFields>

// Author
// Book Author
export interface AuthorFields {
  /** Full Name */
  fullName: string
  /** Biography */
  biography: string
  /** links */
  links?: Entry<LinkFields>[]
}

export type Author = Entry<AuthorFields>

// Link
// Generic Link Type
export interface LinkFields {
  /** Text */
  text: string
  /** Link */
  link: string
}

export type Link = Entry<LinkFields>

// Genre
// Fiction or Non-Fiction plus the subgenre
export interface GenreFields {
  /** Genre */
  genre: string
  /** Sub Genre */
  subGenre: string
}

export type Genre = Entry<GenreFields>

// Union type for all content types
export type ContentfulEntry = Book | Price | Author | Link | Genre

// Content type IDs
export const CONTENT_TYPES = {
  BOOK: 'book',
  PRICE: 'price',
  AUTHOR: 'author',
  LINK: 'link',
  GENRE: 'genre',
} as const

// Helper type for content type mapping
export type ContentTypeMap = {
  [CONTENT_TYPES.BOOK]: Book
  [CONTENT_TYPES.PRICE]: Price
  [CONTENT_TYPES.AUTHOR]: Author
  [CONTENT_TYPES.LINK]: Link
  [CONTENT_TYPES.GENRE]: Genre
}
