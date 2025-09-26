import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface Type3l4dlIj5ZQWxxHnjkY9RZNFields {
    title?: EntryFieldTypes.Symbol;
    excerpt: EntryFieldTypes.Text;
    criticName: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    externalLink?: EntryFieldTypes.Symbol;
    isFeatured?: EntryFieldTypes.Boolean;
    outletName?: EntryFieldTypes.EntryLink<EntrySkeletonType>;
}

export type Type3l4dlIj5ZQWxxHnjkY9RZNSkeleton = EntrySkeletonType<Type3l4dlIj5ZQWxxHnjkY9RZNFields, "3l4dlIj5ZQWxxHnjkY9RZN">;
export type Type3l4dlIj5ZQWxxHnjkY9RZN<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<Type3l4dlIj5ZQWxxHnjkY9RZNSkeleton, Modifiers, Locales>;
export type Type3l4dlIj5ZQWxxHnjkY9RZNWithoutLinkResolutionResponse = Type3l4dlIj5ZQWxxHnjkY9RZN<"WITHOUT_LINK_RESOLUTION">;
export type Type3l4dlIj5ZQWxxHnjkY9RZNWithoutUnresolvableLinksResponse = Type3l4dlIj5ZQWxxHnjkY9RZN<"WITHOUT_UNRESOLVABLE_LINKS">;
export type Type3l4dlIj5ZQWxxHnjkY9RZNWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = Type3l4dlIj5ZQWxxHnjkY9RZN<"WITH_ALL_LOCALES", Locales>;
export type Type3l4dlIj5ZQWxxHnjkY9RZNWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = Type3l4dlIj5ZQWxxHnjkY9RZN<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type Type3l4dlIj5ZQWxxHnjkY9RZNWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = Type3l4dlIj5ZQWxxHnjkY9RZN<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
