const fetch = require('node-fetch');

async function analyzeBooks() {
  try {
    const response = await fetch('http://localhost:3000/api/books');
    const data = await response.json();
    
    const books = data.data;
    const missingContent = [];
    
    books.forEach(book => {
      const hasArticle = book.linkToFeaturedArticle != null;
      const hasPodcast = book.linkToPodcastEpisode != null;
      
      if (!hasArticle || !hasPodcast) {
        missingContent.push({
          id: book.id,
          title: book.title,
          author: book.authors[0]?.fullName,
          missingArticle: !hasArticle,
          missingPodcast: !hasPodcast
        });
      }
    });
    
    console.log(`\n📊 ANALYSIS RESULTS:`);
    console.log(`Total books: ${books.length}`);
    console.log(`Books missing content: ${missingContent.length}\n`);
    
    console.log('📝 BOOKS MISSING FEATURED ARTICLES:');
    const missingArticles = missingContent.filter(b => b.missingArticle);
    missingArticles.forEach(book => {
      console.log(`  • ${book.title} by ${book.author} (ID: ${book.id})`);
    });
    
    console.log('\n🎙️ BOOKS MISSING PODCAST EPISODES:');
    const missingPodcasts = missingContent.filter(b => b.missingPodcast);
    missingPodcasts.forEach(book => {
      console.log(`  • ${book.title} by ${book.author} (ID: ${book.id})`);
    });
    
    // Return the data for further processing
    return missingContent;
    
  } catch (error) {
    console.error('Error analyzing books:', error);
  }
}

analyzeBooks();