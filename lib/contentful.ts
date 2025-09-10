import { createClient, ContentfulApi } from 'contentful'
import { ContentfulEntry, CONTENT_TYPES } from '@/types/contentful'

if (!process.env.CONTENTFUL_SPACE_ID) {
  throw new Error('CONTENTFUL_SPACE_ID environment variable is required')
}

if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
  throw new Error('CONTENTFUL_ACCESS_TOKEN environment variable is required')
}

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
})

export const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  host: 'preview.contentful.com',
})

// Helper functions with types
export async function getEntries<T extends ContentfulEntry>(contentType?: string, query?: any) {
  return contentfulClient.getEntries<T>({
    content_type: contentType,
    ...query,
  })
}

export async function getEntry<T extends ContentfulEntry>(id: string, query?: any) {
  return contentfulClient.getEntry<T>(id, query)
}

// Export content types for easy access
export { CONTENT_TYPES }

export default contentfulClient