import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import type { TypePeopleSkeleton } from "./TypePeople";

export interface TypeAboutFields {
  title?: EntryFieldTypes.Symbol;
  aboutTab?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePeopleSkeleton>>;
  about?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePeopleSkeleton>>;
  friends?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePeopleSkeleton>>;
  whoWeAre?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePeopleSkeleton>>;
}

export type TypeAboutSkeleton = EntrySkeletonType<TypeAboutFields, "about">;
export type TypeAbout<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAboutSkeleton, Modifiers, Locales>;
export type TypeAboutWithoutLinkResolutionResponse =
  TypeAbout<"WITHOUT_LINK_RESOLUTION">;
export type TypeAboutWithoutUnresolvableLinksResponse =
  TypeAbout<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeAboutWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeAbout<"WITH_ALL_LOCALES", Locales>;
export type TypeAboutWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeAbout<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeAboutWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeAbout<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
