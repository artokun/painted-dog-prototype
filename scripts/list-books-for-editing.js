const { listAllBooks } = require('./edit-book-utility');

/**
 * List all books with their IDs and basic info for easy identification
 */
async function listBooksForEditing() {
  try {
    console.log('📚 Fetching all books from Contentful...\n');
    
    const books = await listAllBooks();
    
    if (books.length === 0) {
      console.log('❌ No books found');
      return;
    }
    
    console.log(`Found ${books.length} books:\n`);
    console.log('ID'.padEnd(26) + ' | ' + 'Title'.padEnd(35) + ' | ' + 'Authors'.padEnd(25) + ' | ' + 'Size'.padEnd(4) + ' | Featured');
    console.log('-'.repeat(100));
    
    books.forEach(book => {
      const id = book.id.padEnd(26);
      const title = (book.title || 'Untitled').substring(0, 34).padEnd(35);
      const authors = (book.authors || 'Unknown').substring(0, 24).padEnd(25);
      const size = (book.bookSize || 'N/A').padEnd(4);
      const featured = book.featured ? '⭐' : '  ';
      
      console.log(`${id} | ${title} | ${authors} | ${size} | ${featured}`);
    });
    
    console.log('\n💡 Usage examples:');
    console.log('   # View book details:');
    console.log(`   node edit-book-by-id.js "${books[0]?.id}"`);
    console.log('');
    console.log('   # Edit by title:');
    console.log(`   node edit-book-by-title.js "${books[0]?.title}"`);
    console.log('');
    console.log('   # Update a field:');
    console.log(`   node edit-book-by-id.js "${books[0]?.id}" '{"featured": true}'`);
    
  } catch (error) {
    console.error('❌ Error listing books:', error.message);
    process.exit(1);
  }
}

listBooksForEditing();