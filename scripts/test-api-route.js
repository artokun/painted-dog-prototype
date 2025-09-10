// Simple test to verify the API route works during development
const fetch = require('node-fetch');

async function testApiRoute() {
  console.log('🧪 Testing Books API Route...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/books');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ API Route Working!`);
      console.log(`📚 Books loaded: ${result.count}`);
      console.log(`📏 Sample book sizes:`);
      
      result.data.slice(0, 5).forEach(book => {
        console.log(`   "${book.title}" - ${book.bookSize}`);
      });
    } else {
      console.error('❌ API returned error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Failed to test API route:', error.message);
    console.log('\n💡 Make sure the Next.js dev server is running: npm run dev');
  }
}

testApiRoute();