const { updateBook, getBookForEditing } = require('./edit-book-utility');

/**
 * Edit a book by its Contentful ID
 * Usage: node edit-book-by-id.js "BOOK_ID" '{"field": "value"}'
 */
async function editBookById() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
📖 Edit Book by ID

Usage: node edit-book-by-id.js BOOK_ID [updates]

Examples:
  # Show book details
  node edit-book-by-id.js "1Er7vq6NzmPQB6lulX1UpC"
  
  # Update description
  node edit-book-by-id.js "1Er7vq6NzmPQB6lulX1UpC" '{"description": "New description"}'
  
  # Update size and featured status
  node edit-book-by-id.js "1Er7vq6NzmPQB6lulX1UpC" '{"bookSize": "XL", "featured": true}'

Available fields:
  - title, description, publishDate, bookSize, featured
  - criticalReceptionText, podcastText
  - authors (array of IDs), genre (ID), prices (array of IDs)
  - bookCoverTextureFront (asset ID), bookCoverTextureSide (asset ID)
`);
    process.exit(1);
  }
  
  const bookId = args[0];
  const updatesJson = args[1];
  
  try {
    // Validate book exists
    console.log(`🔍 Fetching book: ${bookId}`);
    const details = await getBookForEditing(bookId);
    
    if (!details.success) {
      console.error(`❌ Book not found: ${bookId}`);
      console.error(`Error: ${details.error}`);
      process.exit(1);
    }
    
    console.log(`✅ Found: "${details.title}"`);
    
    // If no updates provided, just show current details
    if (!updatesJson) {
      console.log('\n📖 Current book details:');
      console.log(`   Title: ${details.title}`);
      console.log(`   Size: ${details.bookSize}`);
      console.log(`   Featured: ${details.featured}`);
      console.log(`   Publish Date: ${details.publishDate}`);
      console.log(`   Description: ${details.description?.substring(0, 200)}...`);
      console.log(`   Critical Reception: ${details.criticalReceptionText ? details.criticalReceptionText.length + ' chars' : 'None'}`);
      console.log(`   Podcast Content: ${details.podcastText ? details.podcastText.length + ' chars' : 'None'}`);
      console.log(`   Authors: ${details.authors?.join(', ') || 'None'}`);
      console.log(`   Genre: ${details.genre || 'None'}`);
      console.log(`   Prices: ${details.prices?.join(', ') || 'None'}`);
      console.log(`   Featured Article Link: ${details.linkToFeaturedArticle || 'None'}`);
      console.log(`   Podcast Episode Link: ${details.linkToPodcastEpisode || 'None'}`);
      console.log(`   Version: ${details.version} (Published: ${details.publishedVersion || 'Draft'})`);
      return;
    }
    
    // Parse and apply updates
    let updates;
    try {
      updates = JSON.parse(updatesJson);
    } catch (error) {
      console.error('❌ Invalid JSON for updates:', error.message);
      console.log('\nExample: \'{"description": "New description", "featured": true}\'');
      process.exit(1);
    }
    
    console.log('\n📝 Applying updates...');
    Object.entries(updates).forEach(([field, value]) => {
      const preview = typeof value === 'string' && value.length > 50 
        ? value.substring(0, 50) + '...' 
        : value;
      console.log(`   ${field}: ${preview}`);
    });
    
    const result = await updateBook(bookId, updates);
    
    if (result.success) {
      console.log('\n🎉 Book updated successfully!');
      if (result.changes.length > 0) {
        console.log('📋 Changes applied:');
        result.changes.forEach(change => console.log(`   ✓ ${change}`));
      }
    } else {
      console.error('\n❌ Update failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

editBookById();