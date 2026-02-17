import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeLinkSkeleton } from "./TypeLink";

export interface TypeAuthorFields {
    fullName: EntryFieldTypes.Symbol;
    biography: EntryFieldTypes.Text;
    links?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeLinkSkeleton>>;
}

export type TypeAuthorSkeleton = EntrySkeletonType<TypeAuthorFields, "author">;
export type TypeAuthor<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAuthorSkeleton, Modifiers, Locales>;
export type TypeAuthorWithoutLinkResolutionResponse = TypeAuthor<"WITHOUT_LINK_RESOLUTION">;
export type TypeAuthorWithoutUnresolvableLinksResponse = TypeAuthor<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeAuthorWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeAuthor<"WITH_ALL_LOCALES", Locales>;
export type TypeAuthorWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeAuthor<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeAuthorWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeAuthor<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
