// Contentful-specific types and content type IDs

import type { Entry } from "contentful";
import type {
  TypeAboutSkeleton,
  TypeBookSkeleton,
  TypeAuthorSkeleton,
  TypeGenreSkeleton,
  TypePriceSkeleton,
  TypeLinkSkeleton,
  TypeReviewSkeleton,
  TypePodcastEpisodeSkeleton,
  TypeLegalPageSkeleton,
  TypePolicySkeleton,
  TypePeopleSkeleton,
  TypeNewsArticleSkeleton,
  TypeNewsCategorySkeleton,
} from "./index";

// Union type for all Contentful entries
export type ContentfulEntry =
  | Entry<TypeAboutSkeleton>
  | Entry<TypeBookSkeleton>
  | Entry<TypeAuthorSkeleton>
  | Entry<TypeGenreSkeleton>
  | Entry<TypePriceSkeleton>
  | Entry<TypeLinkSkeleton>
  | Entry<TypeReviewSkeleton>
  | Entry<TypePodcastEpisodeSkeleton>
  | Entry<TypeLegalPageSkeleton>
  | Entry<TypePolicySkeleton>
  | Entry<TypePeopleSkeleton>
  | Entry<TypeNewsArticleSkeleton>
  | Entry<TypeNewsCategorySkeleton>;

// Content type IDs for easy reference
export const CONTENT_TYPES = {
  about: "about",
  book: "book",
  author: "author",
  genre: "genre",
  price: "price",
  link: "link",
  review: "review",
  podcastEpisode: "podcastEpisode",
  legalPage: "legalPage",
  policy: "policy",
  people: "people",
  newsArticle: "newsArticle",
  newsCategory: "newsCategory",
} as const;