# Contentful Book Creation Guide

This guide documents the complete process for creating book entries in Contentful using the Management API, including dimension research, size mapping, and proper content formatting.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Book Creation Process](#book-creation-process)
4. [Size Mapping System](#size-mapping-system)
5. [Content Structure](#content-structure)
6. [Scripts Reference](#scripts-reference)
7. [Specialized Agent Specification](#specialized-agent-specification)
8. [Troubleshooting](#troubleshooting)

## Overview

The book creation process involves:
1. **Research**: Finding real-world book dimensions
2. **Mapping**: Converting dimensions to our size system
3. **Content Creation**: Building rich, structured entries
4. **Asset Management**: Using appropriate template textures
5. **Publishing**: Creating linked entries and publishing

## Prerequisites

### Environment Setup
```bash
# Install dependencies
npm install contentful contentful-management dotenv

# Environment variables in .env.local
CONTENTFUL_SPACE_ID=7cnra0r5550h
CONTENTFUL_ACCESS_TOKEN=<delivery-token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview-token>
CONTENTFUL_MANAGEMENT_TOKEN=<management-token>
CONTENTFUL_ENVIRONMENT=master
```

### Required Assets
The following template textures must exist in Contentful:
- `template-front-xs.jpg` (108×174mm)
- `template-front-sm.jpg` (127×203mm) 
- `template-front-md.jpg` (133×203mm)
- `template-front-lg.jpg` (140×216mm)
- `template-front-xl.jpg` (152×229mm)
- `template-side-xs.jpg` (108×174mm)
- `template-side-sm.jpg` (127×203mm)
- `template-side-md.jpg` (133×203mm)
- `template-side-lg.jpg` (140×216mm)
- `template-side-xl.jpg` (152×229mm)

## Book Creation Process

### Step 1: Research Book Dimensions

Use web search to find real-world book dimensions:

```javascript
// Example search queries
"[Book Title] [Author] book dimensions height width paperback hardcover"
"[Book Title] product specifications physical dimensions"
"[Book Title] ISBN dimensions size measurements"
```

**Common sources:**
- Amazon product pages
- Publisher websites
- Library catalogs
- Bookstore listings

**Expected format:** Usually given as Width × Height in inches
- Example: "5.5 x 8.26 inches"

### Step 2: Convert and Map Dimensions

Convert inches to millimeters and map to size system:

```javascript
// Conversion formula
const widthMM = widthInches * 25.4
const heightMM = heightInches * 25.4

// Size mapping from /public/models/sizes.json
const SIZES = {
  "XS": { "height": 108, "width": 174, "thickness": 0 },
  "SM": { "height": 127, "width": 203, "thickness": 0 },
  "MD": { "height": 133, "width": 203, "thickness": 0 },
  "LG": { "height": 140, "width": 216, "thickness": 0 },
  "XL": { "height": 152, "width": 229, "thickness": 0 }
}

// Find closest match by calculating distance
function findClosestSize(widthMM, heightMM) {
  let closest = 'MD' // default
  let minDistance = Infinity
  
  for (const [size, dims] of Object.entries(SIZES)) {
    const distance = Math.sqrt(
      Math.pow(dims.width - widthMM, 2) + 
      Math.pow(dims.height - heightMM, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      closest = size
    }
  }
  
  return closest
}
```

### Step 3: Research Book Content

Gather the following information:
- **Author biography** (comprehensive, 2-3 paragraphs)
- **Book description** (plot summary, themes, significance)
- **Publication details** (date, publisher, ISBN)
- **Critical reception** (reviews, awards, scholarly articles)
- **Media coverage** (interviews, podcasts, articles)

### Step 4: Create Content Structure

Follow the established format from "The Promise" example:

```javascript
const bookData = {
  // Basic info
  title: "Book Title",
  featured: false, // true for featured books
  description: "# Book Title by Author Name\n\n[Rich markdown description]",
  
  // Metadata
  publishDate: "YYYY-MM-DD",
  bookSize: "LG", // From size mapping
  
  // Content sections
  criticalReceptionText: "# Critical Reception\n\n[Markdown with links]",
  podcastText: "# Podcast Section\n\n[Markdown description]",
  
  // Linked entries (created separately)
  authors: [{ authorId }],
  genre: { genreId },
  prices: [{ priceId }],
  linkToFeaturedArticle: { linkId },
  linkToPodcastEpisode: { linkId },
  
  // Assets
  bookCoverTextureFront: { assetId },
  bookCoverTextureSide: { assetId }
}
```

## Size Mapping System

### Size Categories

| Size | Dimensions (mm) | Typical Use Case |
|------|----------------|------------------|
| XS   | 108 × 174      | Mass market paperback |
| SM   | 127 × 203      | Standard paperback |
| MD   | 133 × 203      | Trade paperback |
| LG   | 140 × 216      | Large paperback/Small hardcover |
| XL   | 152 × 229      | Large hardcover |

### Mapping Examples

```javascript
// Example mappings from real books
const examples = {
  "5.5 x 8.26 inches": "LG", // Disgrace - 140×210mm → 140×216mm
  "5.0 x 8.0 inches": "SM",  // Typical paperback - 127×203mm
  "6.0 x 9.0 inches": "XL"   // Large hardcover - 152×229mm
}
```

## Content Structure

### Required Linked Entries

#### 1. Author Entry
```javascript
{
  contentType: 'author',
  fields: {
    fullName: 'Author Full Name',
    biography: 'Comprehensive biography (2-3 paragraphs)',
    links: [] // Optional author links
  }
}
```

#### 2. Genre Entry
```javascript
{
  contentType: 'genre',
  fields: {
    genre: 'Fiction', // Main category
    subGenre: 'Literary Fiction' // Specific genre
  }
}
```

#### 3. Price Entry
```javascript
{
  contentType: 'price',
  fields: {
    text: 'Paperback',
    price: 24,
    isNew: false,
    description: 'Edition description',
    productInformation: {
      isbn10: '0140296409',
      isbn13: '978-0140296402',
      language: 'English',
      dimensions: '5.5 x 8.26 inches (140 x 210 mm)',
      printLength: '224 pages',
      publisher: 'Publisher Name',
      publicationDate: 'Publication Date'
    }
  }
}
```

#### 4. Link Entries
```javascript
// Featured Article
{
  contentType: 'link',
  fields: {
    text: 'Article Title',
    link: 'https://example.com/article'
  }
}

// Podcast Episode
{
  contentType: 'link',
  fields: {
    text: 'Podcast Episode Title',
    link: 'https://example.com/podcast'
  }
}
```

### Main Book Entry Fields

```javascript
{
  contentType: 'book',
  fields: {
    // Required fields
    title: 'Book Title',
    featured: boolean,
    description: 'Rich markdown description',
    authors: [Author references],
    publishDate: 'YYYY-MM-DD',
    bookSize: 'XS|SM|MD|LG|XL',
    criticalReceptionText: 'Markdown with reviews and links',
    
    // Optional fields
    genre: Genre reference,
    prices: [Price references],
    bookCoverTextureFront: Asset reference,
    bookCoverTextureSide: Asset reference,
    linkToFeaturedArticle: Link reference,
    linkToPodcastEpisode: Link reference,
    podcastText: 'Podcast description markdown',
    podcastLinks: [Link references],
    excerpt: PDF Asset reference
  }
}
```

## Scripts Reference

### Available Scripts

1. **`scripts/generate-contentful-types.js`**
   - Generates TypeScript types from Contentful schema
   - Usage: `npm run generate-types`

2. **`scripts/fetch-existing-book.js`**
   - Fetches existing book to understand format
   - Usage: `node scripts/fetch-existing-book.js`

3. **`scripts/list-assets.js`**
   - Lists all available assets with IDs
   - Usage: `node scripts/list-assets.js`

4. **`scripts/create-disgrace-fixed.js`**
   - Example implementation for creating a book
   - Usage: `node scripts/create-disgrace-fixed.js`

5. **`scripts/migrate-books-to-contentful.js`**
   - Batch migration from books.json
   - Usage: `node scripts/migrate-books-to-contentful.js migrate-all`

### Template Script Structure

```javascript
const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function createBook(bookTitle, authorName, dimensions) {
  const environment = await getEnvironment()
  
  // 1. Research dimensions and map to size
  const size = mapDimensionsToSize(dimensions)
  
  // 2. Create linked entries
  const author = await createAuthor(environment, authorName, biography)
  const genre = await findOrCreateGenre(environment, genreName, subGenre)
  const price = await createPrice(environment, priceData)
  const articleLink = await createLink(environment, articleData)
  const podcastLink = await createLink(environment, podcastData)
  
  // 3. Get texture assets
  const frontTexture = getTextureAsset(size, 'front')
  const sideTexture = getTextureAsset(size, 'side')
  
  // 4. Create main book entry
  const book = await createBookEntry(environment, {
    title: bookTitle,
    size,
    author,
    genre,
    price,
    links: { article: articleLink, podcast: podcastLink },
    textures: { front: frontTexture, side: sideTexture }
  })
  
  return book
}
```

## Specialized Agent Specification

### Agent Requirements

A specialized agent for book creation should have the following capabilities:

#### 1. Research Functions
- **Web search** for book dimensions and metadata
- **ISBN lookup** for publication details
- **Review aggregation** from literary sources
- **Author biography** compilation

#### 2. Data Processing
- **Dimension conversion** (inches to mm)
- **Size mapping** to template system
- **Content formatting** to markdown
- **Link validation** and formatting

#### 3. Contentful Operations
- **Asset management** (find/upload textures)
- **Entry creation** with proper linking
- **Publishing workflow** management
- **Error handling** and retries

#### 4. Content Generation
- **Rich descriptions** in house style
- **Critical reception** compilation
- **Podcast content** generation
- **Product information** formatting

### Agent Interface

```typescript
interface BookCreationAgent {
  // Main creation function
  createBook(params: {
    title: string
    author: string
    sourceData?: Partial<BookData>
  }): Promise<ContentfulBook>
  
  // Research functions
  researchDimensions(title: string, author: string): Promise<Dimensions>
  researchMetadata(title: string, author: string): Promise<BookMetadata>
  
  // Processing functions
  mapDimensionsToSize(dimensions: Dimensions): BookSize
  formatDescription(bookData: BookMetadata): string
  generateCriticalReception(bookData: BookMetadata): string
  
  // Contentful operations
  createLinkedEntries(bookData: BookData): Promise<LinkedEntries>
  uploadOrFindAssets(size: BookSize): Promise<TextureAssets>
  publishBook(bookData: BookData, linkedEntries: LinkedEntries): Promise<ContentfulBook>
}
```

### Agent Prompts

#### Research Phase
```
You are a literary research specialist. Given a book title and author:

1. Find the exact physical dimensions of the book (prioritize paperback editions)
2. Research publication details (publisher, date, ISBN)
3. Compile author biography from reliable sources
4. Find 2-3 significant reviews or critical articles
5. Look for podcast/media coverage

Format findings as structured data with sources.
```

#### Content Generation Phase
```
You are a literary content creator for Painted Dog Press. Using the research data:

1. Write a compelling book description in markdown (2-3 paragraphs)
2. Create a "Critical Reception" section with linked reviews
3. Generate podcast content description
4. Format all product information properly

Follow the house style established in "The Promise" example.
```

#### Technical Implementation Phase
```
You are a Contentful integration specialist. Using the formatted content:

1. Map book dimensions to the size system (XS/SM/MD/LG/XL)
2. Create all linked entries (author, genre, price, links)
3. Find appropriate texture assets for the book size
4. Publish the complete book entry with all relationships

Handle errors gracefully and provide detailed logging.
```

## Troubleshooting

### Common Issues

#### 1. "Validation error: Same field value present"
**Problem**: Trying to create duplicate genre/author entries
**Solution**: Use `findOrCreateGenre()` function to reuse existing entries

#### 2. "Could not find template textures"
**Problem**: Missing texture assets for the mapped size
**Solution**: Check available assets with `list-assets.js` and upload missing templates

#### 3. "Invalid dimensions data"
**Problem**: Research returned unclear or missing dimension data
**Solution**: Try alternative sources or use fallback dimensions based on book type

#### 4. Rate limiting errors
**Problem**: Too many API calls in quick succession
**Solution**: Add delays between operations (`setTimeout(1000)`)

### Best Practices

1. **Always research first** - Don't guess dimensions or content
2. **Reuse existing entries** - Check for existing authors/genres before creating
3. **Validate data** - Ensure all required fields are present
4. **Test in development** - Use preview environment for testing
5. **Log everything** - Maintain detailed logs for debugging
6. **Handle errors gracefully** - Don't fail the entire process for one missing field

### Testing Procedure

1. **Run type generation**: `npm run generate-types`
2. **List available assets**: `node scripts/list-assets.js`
3. **Test with known book**: Use "Disgrace" script as template
4. **Verify in Contentful**: Check all linked entries are correct
5. **Test frontend**: Ensure book appears correctly in 3D app

---

## Example Implementation

See `scripts/create-disgrace-fixed.js` for a complete working example that demonstrates:
- Dimension research and mapping
- Content structure following "The Promise" format
- Proper error handling for existing entries
- Asset management and linking
- Rich content generation

This script can serve as a template for the specialized agent implementation.