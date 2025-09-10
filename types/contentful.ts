// Auto-generated Contentful types
// Generated on 2025-09-10T01:30:32.012Z
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
  authors: Entry<AuthorSkeleton>[]
  /** Publish Date */
  publishDate: string
  /** Genre */
  genre?: Entry<GenreSkeleton>
  /** Prices */
  prices: Entry<PriceSkeleton>[]
  /** Book Size */
  bookSize: string
  /** Book Cover Front Texture */
  bookCoverTextureFront: Asset
  /** Book Cover Side Texture */
  bookCoverTextureSide: Asset
  /** Link to Featured Article */
  linkToFeaturedArticle?: Entry<LinkSkeleton>
  /** Link to Podcast Episode */
  linkToPodcastEpisode?: Entry<LinkSkeleton>
  /** Critical Reception Text */
  criticalReceptionText: string
  /** Podcast Text */
  podcastText?: string
  /** Podcast Links */
  podcastLinks?: Entry<LinkSkeleton>[]
  /** Excerpt PDF */
  excerpt?: Asset
}

export interface BookSkeleton {
  contentTypeId: 'book'
  fields: BookFields
}

export type Book = Entry<BookSkeleton>

// Link
// Generic Link Type
export interface LinkFields {
  /** Text */
  text: string
  /** Link */
  link: string
  /** Vendor Icon (optional) */
  vendor?: string
}

export interface LinkSkeleton {
  contentTypeId: 'link'
  fields: LinkFields
}

export type Link = Entry<LinkSkeleton>

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

export interface PriceSkeleton {
  contentTypeId: 'price'
  fields: PriceFields
}

export type Price = Entry<PriceSkeleton>

// Author
// Book Author
export interface AuthorFields {
  /** Full Name */
  fullName: string
  /** Biography */
  biography: string
  /** links */
  links?: Entry<LinkSkeleton>[]
}

export interface AuthorSkeleton {
  contentTypeId: 'author'
  fields: AuthorFields
}

export type Author = Entry<AuthorSkeleton>

// Genre
// Fiction or Non-Fiction plus the subgenre
export interface GenreFields {
  /** Genre */
  genre: string
  /** Sub Genre */
  subGenre: string
}

export interface GenreSkeleton {
  contentTypeId: 'genre'
  fields: GenreFields
}

export type Genre = Entry<GenreSkeleton>

// Union type for all content types
export type ContentfulEntry = Book | Link | Price | Author | Genre

// Content type IDs
export const CONTENT_TYPES = {
  BOOK: 'book',
  LINK: 'link',
  PRICE: 'price',
  AUTHOR: 'author',
  GENRE: 'genre',
} as const

// Helper type for content type mapping
export type ContentTypeMap = {
  [CONTENT_TYPES.BOOK]: Book
  [CONTENT_TYPES.LINK]: Link
  [CONTENT_TYPES.PRICE]: Price
  [CONTENT_TYPES.AUTHOR]: Author
  [CONTENT_TYPES.GENRE]: Genre
}
