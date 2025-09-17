import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeReviewFields {
    title: EntryFieldTypes.Symbol;
    excerpt: EntryFieldTypes.Text;
    criticName: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    externalLink: EntryFieldTypes.Symbol;
    isFeatured?: EntryFieldTypes.Boolean;
}

export type TypeReviewSkeleton = EntrySkeletonType<TypeReviewFields, "review">;
export type TypeReview<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeReviewSkeleton, Modifiers, Locales>;
export type TypeReviewWithoutLinkResolutionResponse = TypeReview<"WITHOUT_LINK_RESOLUTION">;
export type TypeReviewWithoutUnresolvableLinksResponse = TypeReview<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeReviewWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeReview<"WITH_ALL_LOCALES", Locales>;
export type TypeReviewWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeReview<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeReviewWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeReview<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
