// This file provides backwards compatibility with the generated types
export * from './index';

// Compatibility types for existing code
export type { TypeBook } from './TypeBook';
export type { TypeBookSkeleton } from './TypeBook';
export type { TypeAuthorSkeleton } from './TypeAuthor';
export type { TypeGenreSkeleton } from './TypeGenre';
export type { TypePriceSkeleton } from './TypePrice';
export type { TypeLinkSkeleton } from './TypeLink';

import type { Entry } from 'contentful';
import type { 
  TypeBookSkeleton, 
  TypeAuthorSkeleton, 
  TypeGenreSkeleton, 
  TypePriceSkeleton, 
  TypeLinkSkeleton 
} from './index';

// Union type of all content entry types
export type ContentfulEntry = 
  | Entry<TypeBookSkeleton>
  | Entry<TypeAuthorSkeleton>
  | Entry<TypeGenreSkeleton>
  | Entry<TypePriceSkeleton>
  | Entry<TypeLinkSkeleton>;

// Content type constants  
export const CONTENT_TYPES = {
  book: 'book',
  author: 'author',
  genre: 'genre',
  price: 'price',
  link: 'link'
} as const;