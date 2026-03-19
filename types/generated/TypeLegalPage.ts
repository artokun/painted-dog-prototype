import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypePolicySkeleton } from "./TypePolicy";

export interface TypeLegalPageFields {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    policies: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypePolicySkeleton>>;
}

export type TypeLegalPageSkeleton = EntrySkeletonType<TypeLegalPageFields, "legalPage">;
export type TypeLegalPage<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeLegalPageSkeleton, Modifiers, Locales>;
export type TypeLegalPageWithoutLinkResolutionResponse = TypeLegalPage<"WITHOUT_LINK_RESOLUTION">;
export type TypeLegalPageWithoutUnresolvableLinksResponse = TypeLegalPage<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeLegalPageWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeLegalPage<"WITH_ALL_LOCALES", Locales>;
export type TypeLegalPageWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeLegalPage<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeLegalPageWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeLegalPage<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
