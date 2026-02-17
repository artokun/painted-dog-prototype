import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypePolicyFields {
    policyId: EntryFieldTypes.Symbol;
    navTitle: EntryFieldTypes.Symbol;
    title: EntryFieldTypes.Symbol;
    content: EntryFieldTypes.Text;
}

export type TypePolicySkeleton = EntrySkeletonType<TypePolicyFields, "policy">;
export type TypePolicy<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePolicySkeleton, Modifiers, Locales>;
export type TypePolicyWithoutLinkResolutionResponse = TypePolicy<"WITHOUT_LINK_RESOLUTION">;
export type TypePolicyWithoutUnresolvableLinksResponse = TypePolicy<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypePolicyWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypePolicy<"WITH_ALL_LOCALES", Locales>;
export type TypePolicyWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypePolicy<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypePolicyWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypePolicy<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
