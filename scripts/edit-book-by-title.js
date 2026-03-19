const { updateBook, getBookForEditing, listAllBooks } = require('./edit-book-utility');

/**
 * Edit a book by searching for it by title
 * Usage: node edit-book-by-title.js "Book Title" '{"description": "New description", "featured": true}'
 */
async function editBookByTitle() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
📖 Edit Book by Title

Usage: node edit-book-by-title.js "Book Title" [updates]

Examples:
  # Show book details
  node edit-book-by-title.js "Disgrace"
  
  # Update description
  node edit-book-by-title.js "Disgrace" '{"description": "New description here"}'
  
  # Update multiple fields
  node edit-book-by-title.js "Disgrace" '{"featured": true, "bookSize": "LG", "description": "Updated description"}'
  
  # Update content sections
  node edit-book-by-title.js "Disgrace" '{"criticalReceptionText": "# New Critical Reception\\n\\nContent here...", "podcastText": "# New Podcast\\n\\nContent here..."}'

Available fields:
  - title, description, publishDate, bookSize, featured
  - criticalReceptionText, podcastText
  - authors (array of IDs), genre (ID), prices (array of IDs)
  - bookCoverTextureFront (asset ID), bookCoverTextureSide (asset ID)
`);
    process.exit(1);
  }
  
  const titleSearch = args[0];
  const updatesJson = args[1];
  
  try {
    // Find book by title
    console.log(`🔍 Searching for book: "${titleSearch}"`);
    const allBooks = await listAllBooks();
    
    const matchingBooks = allBooks.filter(book => 
      book.title && book.title.toLowerCase().includes(titleSearch.toLowerCase())
    );
    
    if (matchingBooks.length === 0) {
      console.log(`❌ No books found matching: "${titleSearch}"`);
      console.log('\n📚 Available books:');
      allBooks.slice(0, 10).forEach(book => {
        console.log(`   - "${book.title}" by ${book.authors || 'Unknown'}`);
      });
      process.exit(1);
    }
    
    if (matchingBooks.length > 1) {
      console.log(`⚠️ Multiple books found matching: "${titleSearch}"`);
      matchingBooks.forEach(book => {
        console.log(`   - "${book.title}" by ${book.authors || 'Unknown'} (ID: ${book.id})`);
      });
      console.log('\nPlease be more specific or use the exact title.');
      process.exit(1);
    }
    
    const book = matchingBooks[0];
    console.log(`✅ Found: "${book.title}" by ${book.authors || 'Unknown'} (ID: ${book.id})`);
    
    // If no updates provided, just show current details
    if (!updatesJson) {
      console.log('\n📖 Current book details:');
      const details = await getBookForEditing(book.id);
      if (details.success) {
        console.log(`   Title: ${details.title}`);
        console.log(`   Size: ${details.bookSize}`);
        console.log(`   Featured: ${details.featured}`);
        console.log(`   Publish Date: ${details.publishDate}`);
        console.log(`   Description: ${details.description?.substring(0, 200)}...`);
        console.log(`   Critical Reception: ${details.criticalReceptionText ? details.criticalReceptionText.length + ' chars' : 'None'}`);
        console.log(`   Podcast Content: ${details.podcastText ? details.podcastText.length + ' chars' : 'None'}`);
        console.log(`   Version: ${details.version} (Published: ${details.publishedVersion || 'Draft'})`);
      }
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
    
    const result = await updateBook(book.id, updates);
    
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

editBookByTitle();