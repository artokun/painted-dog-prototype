const { createClient } = require('contentful');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

async function testContentfulIntegration() {
  console.log('🧪 Testing Contentful Integration...\n');
  
  try {
    console.log('📚 Fetching books from Contentful...');
    const response = await client.getEntries({
      content_type: 'book',
      include: 3,
      order: 'fields.publishDate',
    });
    
    console.log(`✅ Successfully fetched ${response.items.length} books from Contentful\n`);
    
    response.items.forEach(item => {
      const fields = item.fields;
      console.log(`📖 "${fields.title}"`);
      console.log(`   📏 Size: ${fields.bookSize}`);
      console.log(`   📅 Published: ${fields.publishDate}`);
      console.log(`   ⭐ Featured: ${fields.featured ? 'Yes' : 'No'}`);
      if (fields.authors && fields.authors.length > 0) {
        console.log(`   👤 Author: ${fields.authors[0].fields?.fullName || 'Unknown'}`);
      }
      if (fields.genre) {
        console.log(`   🏷️ Genre: ${fields.genre.fields?.subGenre || 'Unknown'}`);
      }
      if (fields.prices && fields.prices.length > 0) {
        console.log(`   💰 Price: $${fields.prices[0].fields?.price || 'N/A'}`);
      }
      console.log('');
    });
    
    console.log('🎯 Testing size distribution:');
    const sizeDistribution = response.items.reduce((acc, item) => {
      const size = item.fields.bookSize;
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(sizeDistribution).forEach(([size, count]) => {
      console.log(`   ${size}: ${count} book(s)`);
    });
    
    console.log('\n🎉 Contentful integration test completed successfully!');
    console.log('🚀 The app should now be able to fetch and display these books in 3D!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

testContentfulIntegration();