import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeLinkSkeleton } from "./TypeLink";

export interface TypeEditorsFields {
    fullName: EntryFieldTypes.Symbol;
    biography: EntryFieldTypes.Text;
    links?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeLinkSkeleton>>;
}

export type TypeEditorsSkeleton = EntrySkeletonType<TypeEditorsFields, "editors">;
export type TypeEditors<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeEditorsSkeleton, Modifiers, Locales>;
export type TypeEditorsWithoutLinkResolutionResponse = TypeEditors<"WITHOUT_LINK_RESOLUTION">;
export type TypeEditorsWithoutUnresolvableLinksResponse = TypeEditors<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeEditorsWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeEditors<"WITH_ALL_LOCALES", Locales>;
export type TypeEditorsWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeEditors<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeEditorsWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeEditors<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
