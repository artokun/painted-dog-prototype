const { createClient } = require('contentful')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
})

async function fetchThePromise() {
  try {
    console.log('🔍 Fetching "The Promise" from Contentful...')
    
    const entries = await client.getEntries({
      content_type: 'book',
      'fields.title': 'The Promise',
      include: 3 // Include linked entries
    })
    
    if (entries.items.length > 0) {
      const book = entries.items[0]
      console.log('✅ Found "The Promise":')
      console.log(JSON.stringify(book, null, 2))
      
      // Also show includes (linked entries)
      if (entries.includes) {
        console.log('\n📎 Linked entries:')
        console.log(JSON.stringify(entries.includes, null, 2))
      }
      
      return book
    } else {
      console.log('❌ "The Promise" not found in Contentful')
      return null
    }
    
  } catch (error) {
    console.error('❌ Error fetching book:', error.message)
  }
}

fetchThePromise()