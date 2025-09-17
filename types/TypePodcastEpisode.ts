import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypePodcastEpisodeFields {
    title: EntryFieldTypes.Symbol;
    excerpt: EntryFieldTypes.Text;
    hostName: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    externalLink: EntryFieldTypes.Symbol;
    isFeatured?: EntryFieldTypes.Boolean;
}

export type TypePodcastEpisodeSkeleton = EntrySkeletonType<TypePodcastEpisodeFields, "podcastEpisode">;
export type TypePodcastEpisode<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePodcastEpisodeSkeleton, Modifiers, Locales>;
export type TypePodcastEpisodeWithoutLinkResolutionResponse = TypePodcastEpisode<"WITHOUT_LINK_RESOLUTION">;
export type TypePodcastEpisodeWithoutUnresolvableLinksResponse = TypePodcastEpisode<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypePodcastEpisodeWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypePodcastEpisode<"WITH_ALL_LOCALES", Locales>;
export type TypePodcastEpisodeWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypePodcastEpisode<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypePodcastEpisodeWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypePodcastEpisode<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
