import { getEntries } from "./contentful";
import { CONTENT_TYPES } from "../types/contentful";
import type { TypeLegalPage, TypePolicy } from "@/types";

type LegalPageEntry = TypeLegalPage<"WITHOUT_UNRESOLVABLE_LINKS">;
type PolicyEntry = TypePolicy<"WITHOUT_UNRESOLVABLE_LINKS">;

const DEFAULT_LOCALE = "en-US";

const isPolicyEntry = (entry: unknown): entry is PolicyEntry => {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  return "sys" in entry && "fields" in entry;
};

function getLocalizedString(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => getLocalizedString(item)).join(" ").trim();
  }

  if (typeof value === "object") {
    const localized = value as Record<string, unknown>;
    if (DEFAULT_LOCALE in localized) {
      return getLocalizedString(localized[DEFAULT_LOCALE]);
    }
    const firstKey = Object.keys(localized)[0];
    if (firstKey) {
      return getLocalizedString(localized[firstKey]);
    }
  }

  return "";
}

export interface LegalPolicyData {
  id: string;
  navTitle: string;
  title: string;
  content: string;
}

export interface LegalPageData {
  id: string;
  title: string;
  slug: string;
  policies: LegalPolicyData[];
  metaDescription: string;
}

export async function getLegalPageData(): Promise<LegalPageData | null> {
  const response = await getEntries<LegalPageEntry>(CONTENT_TYPES.legalPage, {
    "fields.slug": "legal-page",
    include: 2,
    limit: 1,
  });

  if (!response.items.length) {
    return null;
  }

  const legalPage = response.items[0];
  const fields = legalPage.fields;

  const policies = Array.isArray(fields.policies)
    ? (fields.policies as unknown[])
        .filter(isPolicyEntry)
        .map((policy) => ({
          id: getLocalizedString(policy.fields.policyId) || policy.sys.id,
          navTitle: getLocalizedString(policy.fields.navTitle),
          title: getLocalizedString(policy.fields.title),
          content: getLocalizedString(policy.fields.content),
        }))
    : [];

  const title = getLocalizedString(fields.title) || "Privacy & Legal Policy";
  const slug = getLocalizedString(fields.slug) || "legal";
  const metaDescription = policies
    .map((policy) => `${policy.title}: ${policy.content}`)
    .join(" ")
    .slice(0, 320);

  return {
    id: legalPage.sys.id,
    title,
    slug,
    policies,
    metaDescription,
  };
}
