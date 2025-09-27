import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import type { Type3l4dlIj5ZQWxxHnjkY9RZNSkeleton } from "../Type3l4dlIj5ZQWxxHnjkY9RZN";
import type { Type3sYm5RaSUV7kLx6CvgMNn8Skeleton } from "./Type3sYm5RaSUV7kLx6CvgMNn8";
import type { TypeAuthorSkeleton } from "./TypeAuthor";
import type { TypeEditorsSkeleton } from "./TypeEditors";
import type { TypeGenreSkeleton } from "./TypeGenre";
import type { TypePriceSkeleton } from "./TypePrice";

export interface TypeBookFields {
  title: EntryFieldTypes.Symbol;
  isbn: EntryFieldTypes.Symbol;
  featured?: EntryFieldTypes.Boolean;
  description: EntryFieldTypes.Text;
  authors: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeAuthorSkeleton>>;
  editors?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeEditorsSkeleton>
  >;
  publishDate: EntryFieldTypes.Date;
  genre?: EntryFieldTypes.EntryLink<TypeGenreSkeleton>;
  prices: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePriceSkeleton>>;
  bookSize: EntryFieldTypes.Symbol<
    "280x260" | "LG" | "MD" | "SM" | "XL" | "XS"
  >;
  bookTexture?: EntryFieldTypes.AssetLink;
  excerpt?: EntryFieldTypes.AssetLink;
  reviews?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<Type3l4dlIj5ZQWxxHnjkY9RZNSkeleton>
  >;
  podcastEpisodes?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<Type3sYm5RaSUV7kLx6CvgMNn8Skeleton>
  >;
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
