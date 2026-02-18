import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import type { TypeLinkSkeleton } from "./TypeLink";

export interface TypePeopleFields {
  name: EntryFieldTypes.Symbol;
  description: EntryFieldTypes.RichText;
  links?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeLinkSkeleton>>;
}

export type TypePeopleSkeleton = EntrySkeletonType<TypePeopleFields, "people">;
export type TypePeople<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypePeopleSkeleton, Modifiers, Locales>;
export type TypePeopleWithoutLinkResolutionResponse =
  TypePeople<"WITHOUT_LINK_RESOLUTION">;
export type TypePeopleWithoutUnresolvableLinksResponse =
  TypePeople<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypePeopleWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypePeople<"WITH_ALL_LOCALES", Locales>;
export type TypePeopleWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypePeople<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypePeopleWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypePeople<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
