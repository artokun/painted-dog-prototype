import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface Type3sYm5RaSUV7kLx6CvgMNn8Fields {
    title: EntryFieldTypes.Symbol;
    excerpt: EntryFieldTypes.Text;
    hostName: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    externalLink: EntryFieldTypes.Symbol;
    isFeatured?: EntryFieldTypes.Boolean;
}

export type Type3sYm5RaSUV7kLx6CvgMNn8Skeleton = EntrySkeletonType<Type3sYm5RaSUV7kLx6CvgMNn8Fields, "3sYm5RaSUV7kLx6CvgMNn8">;
export type Type3sYm5RaSUV7kLx6CvgMNn8<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<Type3sYm5RaSUV7kLx6CvgMNn8Skeleton, Modifiers, Locales>;
export type Type3sYm5RaSUV7kLx6CvgMNn8WithoutLinkResolutionResponse = Type3sYm5RaSUV7kLx6CvgMNn8<"WITHOUT_LINK_RESOLUTION">;
export type Type3sYm5RaSUV7kLx6CvgMNn8WithoutUnresolvableLinksResponse = Type3sYm5RaSUV7kLx6CvgMNn8<"WITHOUT_UNRESOLVABLE_LINKS">;
export type Type3sYm5RaSUV7kLx6CvgMNn8WithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = Type3sYm5RaSUV7kLx6CvgMNn8<"WITH_ALL_LOCALES", Locales>;
export type Type3sYm5RaSUV7kLx6CvgMNn8WithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = Type3sYm5RaSUV7kLx6CvgMNn8<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type Type3sYm5RaSUV7kLx6CvgMNn8WithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = Type3sYm5RaSUV7kLx6CvgMNn8<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
