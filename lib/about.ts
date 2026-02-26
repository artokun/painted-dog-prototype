import type { Entry } from "contentful";
import { contentfulClient, CONTENT_TYPES } from "./contentful";
import type { TypeAbout, TypePeople, TypeLink } from "@/types";
import type { Document } from "@contentful/rich-text-types";

export type ContentfulAboutEntry = TypeAbout<"WITHOUT_UNRESOLVABLE_LINKS">;
export type ContentfulPeopleEntry = TypePeople<"WITHOUT_UNRESOLVABLE_LINKS">;

export interface PersonWithoutLinks {
  name: string;
  description: Document;
}

export interface Person {
  name: string;
  description: Document;
  links?: Array<{
    text: string;
    link: string;
    vendor?: string;
  }>;
}

export interface AboutContent {
  aboutTab: PersonWithoutLinks[];
  about: PersonWithoutLinks[];
  friends: Person[];
  whoWeAre: Person[];
}

// Helper function to get localized field value
function getLocalizedField<T>(field: T | { [locale: string]: T }): T {
  if (field === null || field === undefined) {
    return field as T;
  }

  if (
    typeof field === "object" &&
    field !== null &&
    !Array.isArray(field) &&
    "sys" in field
  ) {
    // It's a linked entry or asset, return as-is
    return field as T;
  }

  // Check if it's a Contentful Document (rich text)
  if (
    typeof field === "object" &&
    field !== null &&
    !Array.isArray(field) &&
    "nodeType" in field &&
    (field as any).nodeType === "document"
  ) {
    // It's a rich text document, return as-is
    return field as T;
  }

  if (typeof field === "object" && field !== null && !Array.isArray(field)) {
    // It's a localized field object
    const localizedField = field as { [locale: string]: T };
    // Try to get en-US first, then any available locale
    return (
      localizedField["en-US"] ||
      localizedField[Object.keys(localizedField)[0]] ||
      (undefined as T)
    );
  }

  // It's a direct value
  return field as T;
}

// Transform a People entry to PersonWithoutLinks (only name and description)
function transformPersonWithoutLinks(entry: ContentfulPeopleEntry): PersonWithoutLinks {
  const fields = entry.fields;

  return {
    name: getLocalizedField(fields.name),
    description: getLocalizedField(fields.description),
  };
}

// Transform a People entry to our Person type
function transformPerson(entry: ContentfulPeopleEntry): Person {
  const fields = entry.fields;

  return {
    name: getLocalizedField(fields.name),
    description: getLocalizedField(fields.description),
    links: fields.links
      ? getLocalizedField(fields.links).map((link: any) => {
          const linkFields = (link as Entry).fields;
          return {
            text: getLocalizedField(linkFields.text as string),
            link: getLocalizedField(linkFields.link as string),
            vendor: linkFields.vendor
              ? getLocalizedField(linkFields.vendor as string)
              : undefined,
          };
        })
      : undefined,
  };
}

// Transform About entry to our AboutContent type
function transformAboutEntry(entry: ContentfulAboutEntry): AboutContent {
  const fields = entry.fields;

  return {
    aboutTab: fields.aboutTab
      ? getLocalizedField(fields.aboutTab).map((person: any) =>
          transformPersonWithoutLinks(person as ContentfulPeopleEntry)
        )
      : [],
    about: fields.about
      ? getLocalizedField(fields.about).map((person: any) =>
          transformPersonWithoutLinks(person as ContentfulPeopleEntry)
        )
      : [],
    friends: fields.friends
      ? getLocalizedField(fields.friends).map((person: any) =>
          transformPerson(person as ContentfulPeopleEntry)
        )
      : [],
    whoWeAre: fields.whoWeAre
      ? getLocalizedField(fields.whoWeAre).map((person: any) =>
          transformPerson(person as ContentfulPeopleEntry)
        )
      : [],
  };
}

// Fetch about page content
export async function getAboutContent(): Promise<AboutContent | null> {
  const client = contentfulClient();

  const entries = await client.getEntries({
    content_type: CONTENT_TYPES.about,
    include: 2, // Include referenced People entries and their links
    limit: 1,
  });
  
  if (entries.items.length === 0) {
    return null;
  }

  return transformAboutEntry(entries.items[0] as ContentfulAboutEntry);
}
