import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import type { TypeNewsCategorySkeleton } from "./TypeNewsCategory";

export interface TypeNewsArticleFields {
  title: EntryFieldTypes.Symbol;
  slug: EntryFieldTypes.Symbol;
  publishDate: EntryFieldTypes.Date;
  excerpt?: EntryFieldTypes.Text;
  summaryCopy?: EntryFieldTypes.RichText;
  author?: EntryFieldTypes.Symbol;
  photoCredit?: EntryFieldTypes.Symbol;
  contentBlock1?: EntryFieldTypes.RichText;
  fullWidthImage?: EntryFieldTypes.AssetLink;
  contentBlock2?: EntryFieldTypes.RichText;
  pullquote?: EntryFieldTypes.Text;
  imageWithCaption?: EntryFieldTypes.AssetLink;
  contentBlock3?: EntryFieldTypes.RichText;
  imageContentBlock3?: EntryFieldTypes.AssetLink;
  contentBlock4?: EntryFieldTypes.RichText;
  imageContentBlock4?: EntryFieldTypes.AssetLink;
  body?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<EntrySkeletonType>>;
  acknowledgements?: EntryFieldTypes.RichText;
  categories?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeNewsCategorySkeleton>
  >;
  coverImage?: EntryFieldTypes.AssetLink;
  tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
}

export type TypeNewsArticleSkeleton = EntrySkeletonType<
  TypeNewsArticleFields,
  "newsArticle"
>;
export type TypeNewsArticle<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeNewsArticleSkeleton, Modifiers, Locales>;
export type TypeNewsArticleWithoutLinkResolutionResponse =
  TypeNewsArticle<"WITHOUT_LINK_RESOLUTION">;
export type TypeNewsArticleWithoutUnresolvableLinksResponse =
  TypeNewsArticle<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeNewsArticleWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsArticle<"WITH_ALL_LOCALES", Locales>;
export type TypeNewsArticleWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsArticle<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeNewsArticleWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsArticle<
  "WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES",
  Locales
>;

