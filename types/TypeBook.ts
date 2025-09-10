import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import type { TypeAuthorSkeleton } from "./TypeAuthor";
import type { TypeGenreSkeleton } from "./TypeGenre";
import type { TypeLinkSkeleton } from "./TypeLink";
import type { TypePriceSkeleton } from "./TypePrice";

export interface TypeBookFields {
  title: EntryFieldTypes.Symbol;
  featured?: EntryFieldTypes.Boolean;
  description: EntryFieldTypes.Text;
  authors: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeAuthorSkeleton>>;
  publishDate: EntryFieldTypes.Date;
  genre?: EntryFieldTypes.EntryLink<TypeGenreSkeleton>;
  prices: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePriceSkeleton>>;
  bookSize: EntryFieldTypes.Symbol<"LG" | "MD" | "SM" | "XL" | "XS">;
  bookCoverTextureFront: EntryFieldTypes.AssetLink;
  bookCoverTextureSide: EntryFieldTypes.AssetLink;
  linkToFeaturedArticle?: EntryFieldTypes.EntryLink<TypeLinkSkeleton>;
  linkToPodcastEpisode?: EntryFieldTypes.EntryLink<TypeLinkSkeleton>;
  criticalReceptionText: EntryFieldTypes.Text;
  podcastText?: EntryFieldTypes.Text;
  podcastLinks?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeLinkSkeleton>
  >;
  textures: {
    front: EntryFieldTypes.AssetLink;
    side: EntryFieldTypes.AssetLink;
  };
  excerpt?: EntryFieldTypes.AssetLink;
}

export type TypeBookSkeleton = EntrySkeletonType<TypeBookFields, "book">;
export type TypeBook<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeBookSkeleton, Modifiers, Locales>;
export type TypeBookWithoutLinkResolutionResponse =
  TypeBook<"WITHOUT_LINK_RESOLUTION">;
export type TypeBookWithoutUnresolvableLinksResponse =
  TypeBook<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeBookWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeBook<"WITH_ALL_LOCALES", Locales>;
export type TypeBookWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeBook<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeBookWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeBook<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
