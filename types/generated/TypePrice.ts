import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypePriceFields {
    text: EntryFieldTypes.Symbol;
    price?: EntryFieldTypes.Number;
    isNew?: EntryFieldTypes.Boolean;
    description: EntryFieldTypes.Text;
    productInformation?: EntryFieldTypes.Object;
}

export type TypePriceSkeleton = EntrySkeletonType<TypePriceFields, "price">;
export type TypePrice<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePriceSkeleton, Modifiers, Locales>;
export type TypePriceWithoutLinkResolutionResponse = TypePrice<"WITHOUT_LINK_RESOLUTION">;
export type TypePriceWithoutUnresolvableLinksResponse = TypePrice<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypePriceWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypePrice<"WITH_ALL_LOCALES", Locales>;
export type TypePriceWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypePrice<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypePriceWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypePrice<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
