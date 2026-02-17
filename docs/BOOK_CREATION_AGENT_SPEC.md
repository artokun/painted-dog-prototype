# Book Creation Agent Specification

## Agent Overview

A specialized agent for automatically creating rich, well-researched book entries in Contentful based on title and author input.

## Core Capabilities

### 1. Research & Data Gathering

- **Dimension Research**: Find real-world book dimensions via web search
- **Metadata Collection**: Gather publication details, ISBNs, publisher info
- **Content Research**: Collect reviews, articles, podcast mentions
- **Author Research**: Compile comprehensive author biographies

### 2. Data Processing & Mapping

- **Size Mapping**: Convert real dimensions to template system (XS/SM/MD/LG/XL)
- **Content Formatting**: Generate rich markdown descriptions
- **Link Validation**: Verify and format external URLs
- **Asset Selection**: Choose appropriate texture templates

### 3. Contentful Integration

- **Entry Creation**: Create linked author, genre, price, and link entries
- **Asset Management**: Find and use existing texture assets
- **Publishing Workflow**: Coordinate publishing of all related entries
- **Error Handling**: Gracefully handle duplicates and missing data

## Input Interface

```typescript
interface BookCreationInput {
  title: string; // "Disgrace"
  author: string; // "J.M. Coetzee"
  sourceData?: {
    // Optional pre-researched data
    dimensions?: string; // "5.5 x 8.26 inches"
    isbn?: string;
    publishDate?: string;
    description?: string;
    price?: number;
  };
}
```

## Output Interface

```typescript
interface BookCreationOutput {
  success: boolean;
  bookId?: string;
  linkedEntries: {
    authorId: string;
    genreId: string;
    priceIds: string[];
    linkIds: string[];
  };
  metadata: {
    researchedSize: string; // "LG"
    realDimensions: string; // "140 x 210 mm"
    textureAssets: string[]; // Asset IDs used
  };
  errors?: string[];
}
```

## Research Phase Prompts

### Dimension Research

```
Research the physical dimensions of the book "[TITLE]" by [AUTHOR].

Search for:
1. Publisher product pages (Amazon, Barnes & Noble, publisher sites)
2. Library catalog entries with physical descriptions
3. Bookstore listings with specifications

Priority: Find paperback edition dimensions in inches (Width × Height)
Format: Return as "W.W x H.H inches" with source URL

If multiple editions found, prefer:
1. Most common paperback edition
2. Original publisher edition
3. Recent reprint edition
```

### Metadata Research

```
Research publication and critical information for "[TITLE]" by [AUTHOR].

Find:
1. Original publication date (YYYY-MM-DD format)
2. Publisher name
3. ISBN-10 and ISBN-13 if available
4. Page count
5. 2-3 significant reviews from reputable sources
6. Any major literary awards won
7. Scholarly or critical articles about the book

Return structured data with source URLs for verification.
```

### Author Research

```
Research comprehensive biography information for author [AUTHOR].

Include:
1. Birth/death dates and places
2. Education and career background
3. Major works and achievements
4. Literary awards and recognition
5. Writing style and themes
6. Personal background relevant to their writing

Write 2-3 paragraphs suitable for a literary press.
Source from academic, publisher, and reputable literary websites.
```

## Content Generation Prompts

### Book Description

```
Write a compelling book description for "[TITLE]" by [AUTHOR] using this research data: [RESEARCH_DATA]

Format as markdown with:
- H1 header: "# [TITLE] by [AUTHOR]"
- 2-3 paragraphs describing plot, themes, and significance
- Mention any major awards or recognition
- Literary and accessible tone suitable for Painted Dog Press

Follow the style established in "The Promise" example.
```

### Critical Reception

```
Create a "Critical Reception" section for "[TITLE]" by [AUTHOR] using: [REVIEW_DATA]

Format as markdown with:
- H1 header: "# Critical Reception"
- 2-3 linked review excerpts with proper citations
- Brief commentary on the book's reception and significance
- End with: "Have you found a review we have excluded? Let us know at reviews@painteddogpress.com"

Use this format for review links:
["Review Title"](URL) by Author Name, Publication, Date
```

### Podcast Content

```
Generate podcast content for "[TITLE]" by [AUTHOR] based on: [MEDIA_DATA]

Create:
1. Podcast episode description (2 paragraphs)
2. Guest and host information
3. Discussion topics related to the book

Format as markdown with H1 header: "# [Creative Podcast Title]"
Style should match literary podcast discussions.
```

## Technical Implementation

### Size Mapping Logic

```typescript
function mapDimensionsToSize(dimensionString: string): BookSize {
  // Parse "5.5 x 8.26 inches" format
  const [width, height] = parseDimensions(dimensionString);
  const [widthMM, heightMM] = convertToMM(width, height);

  // Map to closest size from sizes.json
  const SIZES = {
    XS: { height: 108, width: 174 },
    SM: { height: 127, width: 203 },
    MD: { height: 133, width: 203 },
    LG: { height: 140, width: 216 },
    XL: { height: 152, width: 229 },
  };

  return findClosestSize(widthMM, heightMM, SIZES);
}
```

### Asset Selection

```typescript
function getTextureAssets(size: BookSize): TextureAssets {
  const TEXTURE_MAP = {
    XS: { front: "7dG9T8tnJwuamBDfBfLoeq", side: "34nWVAWGx2yKgs8kZz9YBp" },
    SM: { front: "6UosV9tUXCkwn4sxzxi2Cp", side: "OuerSi1YTfPPLkF2nJ70w" },
    MD: { front: "2X2koL053KqxOR7VfAjGpS", side: "5QSZ6oFRrhZTqOygZejI5l" },
    LG: { front: "5VdkmTfiiaL8EYoC99quEO", side: "Wf1GaODJaewJEeiIyMqUJ" },
    XL: { front: "4ZdDgvoCXQsVEKzh6Advsq", side: "6n3fr7Ho62MEx5jbhdS6ji" },
  };

  return TEXTURE_MAP[size];
}
```

## Error Handling

### Common Scenarios

1. **Duplicate Genre**: Use existing entry instead of creating new
2. **Missing Dimensions**: Fallback to size based on book type/publisher
3. **Invalid URLs**: Skip broken links, log for manual review
4. **Rate Limits**: Implement backoff and retry logic
5. **Missing Assets**: Use closest size texture as fallback

### Validation Steps

1. Verify all required fields are present
2. Validate dimension format and conversion
3. Check that texture assets exist for mapped size
4. Confirm all linked entries were created successfully
5. Test that book entry publishes without errors

## Agent Tools Required

### Research Tools

- **WebSearch**: For finding book information
- **WebFetch**: For extracting data from specific pages
- **URLValidation**: For checking link validity

### Contentful Tools

- **ContentfulRead**: Query existing entries
- **ContentfulWrite**: Create and publish entries
- **AssetManagement**: Find and reference assets

### Processing Tools

- **DimensionParser**: Parse various dimension formats
- **MarkdownGenerator**: Format content consistently
- **DataValidator**: Ensure data quality

## Success Criteria

A successful book creation includes:

- ✅ Accurate size mapping based on real dimensions
- ✅ Rich, well-formatted content in house style
- ✅ All linked entries properly created and published
- ✅ Appropriate texture assets selected and linked
- ✅ Valid external links to reviews and media
- ✅ Complete author biography and publication details
- ✅ Proper error handling and graceful fallbacks

## Example Usage

```typescript
const agent = new BookCreationAgent();

const result = await agent.createBook({
  title: "Disgrace",
  author: "J.M. Coetzee",
});

// Result:
// {
//   success: true,
//   bookId: "5S0TR3SVntqg597W0AaWtG",
//   linkedEntries: { authorId: "...", genreId: "...", ... },
//   metadata: {
//     researchedSize: "LG",
//     realDimensions: "140 x 210 mm",
//     textureAssets: ["5VdkmTfiiaL8EYoC99quEO", "..."]
//   }
// }
```

This agent specification provides a complete blueprint for implementing an automated book creation system that maintains quality and consistency while handling the complexity of research, formatting, and content management.
