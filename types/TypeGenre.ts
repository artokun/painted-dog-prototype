import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeGenreFields {
    genre: EntryFieldTypes.Symbol<"Fiction" | "Non-Fiction" | "Other">;
    subGenre: EntryFieldTypes.Symbol;
}

export type TypeGenreSkeleton = EntrySkeletonType<TypeGenreFields, "genre">;
export type TypeGenre<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeGenreSkeleton, Modifiers, Locales>;
export type TypeGenreWithoutLinkResolutionResponse = TypeGenre<"WITHOUT_LINK_RESOLUTION">;
export type TypeGenreWithoutUnresolvableLinksResponse = TypeGenre<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeGenreWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeGenre<"WITH_ALL_LOCALES", Locales>;
export type TypeGenreWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeGenre<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeGenreWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeGenre<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
