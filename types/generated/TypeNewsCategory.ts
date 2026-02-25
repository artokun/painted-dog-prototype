import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";

export interface TypeNewsCategoryFields {
  name: EntryFieldTypes.Symbol;
  slug: EntryFieldTypes.Symbol;
}

export type TypeNewsCategorySkeleton = EntrySkeletonType<
  TypeNewsCategoryFields,
  "newsCategory"
>;
export type TypeNewsCategory<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeNewsCategorySkeleton, Modifiers, Locales>;
export type TypeNewsCategoryWithoutLinkResolutionResponse =
  TypeNewsCategory<"WITHOUT_LINK_RESOLUTION">;
export type TypeNewsCategoryWithoutUnresolvableLinksResponse =
  TypeNewsCategory<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeNewsCategoryWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsCategory<"WITH_ALL_LOCALES", Locales>;
export type TypeNewsCategoryWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsCategory<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeNewsCategoryWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeNewsCategory<
  "WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES",
  Locales
>;

