import { createClient, type Entry } from "contentful";
import type { ContentfulEntry } from "@/types/contentful";
export { CONTENT_TYPES } from "@/types/contentful";

// Only initialize Contentful clients server-side
let contentfulClient: ReturnType<typeof createClient> | null = null;
let previewClient: ReturnType<typeof createClient> | null = null;

function getContentfulClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Contentful client should only be used server-side');
  }

  if (!contentfulClient) {
    if (!process.env.CONTENTFUL_SPACE_ID) {
      throw new Error("CONTENTFUL_SPACE_ID environment variable is required");
    }

    if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
      throw new Error("CONTENTFUL_ACCESS_TOKEN environment variable is required");
    }

    contentfulClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
    });
  }

  return contentfulClient;
}

function getPreviewClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Contentful preview client should only be used server-side');
  }

  if (!previewClient) {
    if (!process.env.CONTENTFUL_SPACE_ID) {
      throw new Error("CONTENTFUL_SPACE_ID environment variable is required");
    }

    previewClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken:
        process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ||
        process.env.CONTENTFUL_ACCESS_TOKEN!,
      environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
      host: "preview.contentful.com",
    });
  }

  return previewClient;
}

export { getContentfulClient as contentfulClient, getPreviewClient as previewClient };

// Helper functions with types
type InferSkeleton<TEntry> =
  TEntry extends Entry<infer TSkeleton, any, any> ? TSkeleton : never;

export async function getEntries<TEntry extends ContentfulEntry>(
  contentType?: string,
  query?: any
) {
  const client = getContentfulClient();
  return client.getEntries<InferSkeleton<TEntry>>({
    content_type: contentType,
    ...query,
  });
}

export async function getEntry<TEntry extends ContentfulEntry>(
  id: string,
  query?: any
) {
  const client = getContentfulClient();
  return client.getEntry<InferSkeleton<TEntry>>(id, query);
}

// Export content types for easy access
export default contentfulClient;
