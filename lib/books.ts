import { contentfulClient } from './contentful';
import { ContentfulBook } from '@/types/book';
import { BookFields, AuthorFields, GenreFields, PriceFields, LinkFields } from '@/types/contentful';

export interface ContentfulBookEntry {
  sys: {
    id: string;
  };
  fields: BookFields;
}

// Transform Contentful entry to our Book type
export function transformContentfulBook(entry: ContentfulBookEntry): ContentfulBook {
  const fields = entry.fields;
  
  return {
    id: entry.sys.id,
    title: fields.title,
    featured: fields.featured || false,
    description: fields.description,
    publishDate: fields.publishDate,
    bookSize: fields.bookSize as "XS" | "SM" | "MD" | "LG" | "XL",
    
    // Transform linked authors
    authors: fields.authors?.map(authorRef => ({
      id: authorRef.sys.id,
      fullName: (authorRef as any).fields?.fullName || 'Unknown Author',
      biography: (authorRef as any).fields?.biography,
    })) || [],
    
    // Transform genre
    genre: fields.genre ? {
      id: fields.genre.sys.id,
      genre: (fields.genre as any).fields?.genre || 'Fiction',
      subGenre: (fields.genre as any).fields?.subGenre || 'Literary Fiction',
    } : undefined,
    
    // Transform prices
    prices: fields.prices?.map(priceRef => ({
      id: priceRef.sys.id,
      text: (priceRef as any).fields?.text || 'Paperback',
      price: (priceRef as any).fields?.price || 0,
      description: (priceRef as any).fields?.description,
    })) || [],
    
    // Transform links
    linkToFeaturedArticle: fields.linkToFeaturedArticle ? {
      id: fields.linkToFeaturedArticle.sys.id,
      text: (fields.linkToFeaturedArticle as any).fields?.text || '',
      link: (fields.linkToFeaturedArticle as any).fields?.link || '',
    } : undefined,
    
    linkToPodcastEpisode: fields.linkToPodcastEpisode ? {
      id: fields.linkToPodcastEpisode.sys.id,
      text: (fields.linkToPodcastEpisode as any).fields?.text || '',
      link: (fields.linkToPodcastEpisode as any).fields?.link || '',
    } : undefined,
    
    // Rich content
    criticalReceptionText: fields.criticalReceptionText,
    podcastText: fields.podcastText,
    
    // For 3D rendering compatibility
    hidden: false,
    isFeatured: fields.featured || false,
  };
}

// Fetch all books from Contentful (server-side only)
export async function getAllBooks(): Promise<ContentfulBook[]> {
  if (typeof window !== 'undefined') {
    throw new Error('getAllBooks should only be called server-side');
  }

  try {
    const client = contentfulClient();
    const response = await client.getEntries<BookFields>({
      content_type: 'book',
      include: 3, // Include linked entries up to 3 levels deep
      order: 'fields.publishDate', // Order by publish date
    });

    return response.items.map(transformContentfulBook);
  } catch (error) {
    console.error('Error fetching books from Contentful:', error);
    return [];
  }
}

// Fetch a single book by ID (server-side only)
export async function getBookById(id: string): Promise<ContentfulBook | null> {
  if (typeof window !== 'undefined') {
    throw new Error('getBookById should only be called server-side');
  }

  try {
    const client = contentfulClient();
    const response = await client.getEntry<BookFields>(id, {
      include: 3,
    });

    return transformContentfulBook(response as ContentfulBookEntry);
  } catch (error) {
    console.error(`Error fetching book ${id} from Contentful:`, error);
    return null;
  }
}

// Fetch featured books (server-side only)
export async function getFeaturedBooks(): Promise<ContentfulBook[]> {
  if (typeof window !== 'undefined') {
    throw new Error('getFeaturedBooks should only be called server-side');
  }

  try {
    const client = contentfulClient();
    const response = await client.getEntries<BookFields>({
      content_type: 'book',
      'fields.featured': true,
      include: 3,
      order: 'fields.publishDate',
    });

    return response.items.map(transformContentfulBook);
  } catch (error) {
    console.error('Error fetching featured books from Contentful:', error);
    return [];
  }
}

// Convert book data to the map format expected by the store
export function booksArrayToMap(books: ContentfulBook[]): Record<string, ContentfulBook> {
  return books.reduce((map, book) => {
    map[book.id] = book;
    return map;
  }, {} as Record<string, ContentfulBook>);
}