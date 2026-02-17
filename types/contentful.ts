// Contentful-specific types and content type IDs

import type { Entry } from "contentful";
import type {
  TypeBookSkeleton,
  TypeAuthorSkeleton,
  TypeGenreSkeleton,
  TypePriceSkeleton,
  TypeLinkSkeleton,
  TypeReviewSkeleton,
  TypePodcastEpisodeSkeleton,
  TypeLegalPageSkeleton,
  TypePolicySkeleton
} from "./index";

// Union type for all Contentful entries
export type ContentfulEntry =
  | Entry<TypeBookSkeleton>
  | Entry<TypeAuthorSkeleton>
  | Entry<TypeGenreSkeleton>
  | Entry<TypePriceSkeleton>
  | Entry<TypeLinkSkeleton>
  | Entry<TypeReviewSkeleton>
  | Entry<TypePodcastEpisodeSkeleton>
  | Entry<TypeLegalPageSkeleton>
  | Entry<TypePolicySkeleton>;

// Content type IDs for easy reference
export const CONTENT_TYPES = {
  book: "book",
  author: "author",
  genre: "genre",
  price: "price",
  link: "link",
  review: "review",
  podcastEpisode: "podcastEpisode",
  legalPage: "legalPage",
  policy: "policy",
} as const;