const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  return await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
}

/**
 * Update a book entry in Contentful
 * @param {string} bookId - The Contentful entry ID of the book
 * @param {Object} updates - Object containing field updates
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the update operation
 */
async function updateBook(bookId, updates, options = {}) {
  try {
    console.log(`📝 Updating book ${bookId}...`);
    
    const environment = await getEnvironment();
    const book = await environment.getEntry(bookId);
    
    let hasChanges = false;
    const changelog = [];
    
    // Update basic fields
    const basicFields = ['title', 'description', 'publishDate', 'bookSize', 'featured'];
    for (const field of basicFields) {
      if (updates[field] !== undefined) {
        const oldValue = book.fields[field]?.['en-US'];
        book.fields[field] = { 'en-US': updates[field] };
        hasChanges = true;
        changelog.push(`${field}: "${oldValue}" → "${updates[field]}"`);
      }
    }
    
    // Update content fields
    const contentFields = ['criticalReceptionText', 'podcastText'];
    for (const field of contentFields) {
      if (updates[field] !== undefined) {
        const oldLength = book.fields[field]?.['en-US']?.length || 0;
        book.fields[field] = { 'en-US': updates[field] };
        hasChanges = true;
        changelog.push(`${field}: ${oldLength} chars → ${updates[field].length} chars`);
      }
    }
    
    // Handle linked entries (authors, genre, prices, links)
    if (updates.authors) {
      book.fields.authors = {
        'en-US': updates.authors.map(authorId => ({
          sys: { type: 'Link', linkType: 'Entry', id: authorId }
        }))
      };
      hasChanges = true;
      changelog.push(`authors: updated to ${updates.authors.length} entries`);
    }
    
    if (updates.genre) {
      book.fields.genre = {
        'en-US': {
          sys: { type: 'Link', linkType: 'Entry', id: updates.genre }
        }
      };
      hasChanges = true;
      changelog.push(`genre: updated to ${updates.genre}`);
    }
    
    if (updates.prices) {
      book.fields.prices = {
        'en-US': updates.prices.map(priceId => ({
          sys: { type: 'Link', linkType: 'Entry', id: priceId }
        }))
      };
      hasChanges = true;
      changelog.push(`prices: updated to ${updates.prices.length} entries`);
    }
    
    // Handle single link references
    if (updates.linkToFeaturedArticle) {
      book.fields.linkToFeaturedArticle = {
        'en-US': {
          sys: { type: 'Link', linkType: 'Entry', id: updates.linkToFeaturedArticle }
        }
      };
      hasChanges = true;
      changelog.push(`featured article link: updated to ${updates.linkToFeaturedArticle}`);
    }
    
    if (updates.linkToPodcastEpisode) {
      book.fields.linkToPodcastEpisode = {
        'en-US': {
          sys: { type: 'Link', linkType: 'Entry', id: updates.linkToPodcastEpisode }
        }
      };
      hasChanges = true;
      changelog.push(`podcast episode link: updated to ${updates.linkToPodcastEpisode}`);
    }

    // Handle asset references
    if (updates.bookCoverTextureFront) {
      book.fields.bookCoverTextureFront = {
        'en-US': {
          sys: { type: 'Link', linkType: 'Asset', id: updates.bookCoverTextureFront }
        }
      };
      hasChanges = true;
      changelog.push(`front texture: updated to ${updates.bookCoverTextureFront}`);
    }
    
    if (updates.bookCoverTextureSide) {
      book.fields.bookCoverTextureSide = {
        'en-US': {
          sys: { type: 'Link', linkType: 'Asset', id: updates.bookCoverTextureSide }
        }
      };
      hasChanges = true;
      changelog.push(`side texture: updated to ${updates.bookCoverTextureSide}`);
    }
    
    if (!hasChanges) {
      console.log(`⏭️ No changes to apply for ${bookId}`);
      return { success: true, bookId, updated: false, changes: [] };
    }
    
    // Apply updates
    const updatedBook = await book.update();
    
    // Publish if requested
    if (options.publish !== false) {
      await updatedBook.publish();
      console.log(`✅ Book ${bookId} updated and published`);
    } else {
      console.log(`✅ Book ${bookId} updated (draft mode)`);
    }
    
    console.log(`📋 Changes made:`);
    changelog.forEach(change => console.log(`   - ${change}`));
    
    return {
      success: true,
      bookId,
      updated: true,
      changes: changelog,
      entryVersion: updatedBook.sys.version
    };
    
  } catch (error) {
    console.error(`❌ Error updating book ${bookId}:`, error.message);
    return {
      success: false,
      bookId,
      error: error.message,
      updated: false,
      changes: []
    };
  }
}

/**
 * Get a book entry for inspection before editing
 * @param {string} bookId - The Contentful entry ID
 * @returns {Promise<Object>} - Book entry data
 */
async function getBookForEditing(bookId) {
  try {
    const environment = await getEnvironment();
    const book = await environment.getEntry(bookId);
    
    return {
      success: true,
      id: book.sys.id,
      version: book.sys.version,
      publishedVersion: book.sys.publishedVersion,
      title: book.fields.title?.['en-US'],
      description: book.fields.description?.['en-US'],
      bookSize: book.fields.bookSize?.['en-US'],
      featured: book.fields.featured?.['en-US'],
      publishDate: book.fields.publishDate?.['en-US'],
      criticalReceptionText: book.fields.criticalReceptionText?.['en-US'],
      podcastText: book.fields.podcastText?.['en-US'],
      authors: book.fields.authors?.['en-US']?.map(ref => ref.sys.id),
      genre: book.fields.genre?.['en-US']?.sys.id,
      prices: book.fields.prices?.['en-US']?.map(ref => ref.sys.id),
      linkToFeaturedArticle: book.fields.linkToFeaturedArticle?.['en-US']?.sys.id,
      linkToPodcastEpisode: book.fields.linkToPodcastEpisode?.['en-US']?.sys.id,
    };
  } catch (error) {
    console.error(`❌ Error fetching book ${bookId}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * List all books with basic info for easy identification
 * @returns {Promise<Array>} - List of books
 */
async function listAllBooks() {
  try {
    const environment = await getEnvironment();
    const books = await environment.getEntries({
      content_type: 'book',
      limit: 1000,
      order: 'fields.title'
    });
    
    return books.items.map(book => ({
      id: book.sys.id,
      title: book.fields.title?.['en-US'],
      authors: book.fields.authors?.['en-US']?.map(ref => ref.fields?.fullName || 'Unknown').join(', '),
      bookSize: book.fields.bookSize?.['en-US'],
      featured: book.fields.featured?.['en-US'] || false,
      version: book.sys.version,
      publishedVersion: book.sys.publishedVersion
    }));
  } catch (error) {
    console.error('❌ Error listing books:', error.message);
    return [];
  }
}

module.exports = {
  updateBook,
  getBookForEditing,
  listAllBooks,
  getEnvironment
};