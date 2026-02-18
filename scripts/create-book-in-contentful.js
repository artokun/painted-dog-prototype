const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function createBook(bookData) {
  try {
    console.log(`📚 Creating book: ${bookData.title}`)
    
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
    
    // Map your books.json structure to Contentful fields
    const entryData = {
      fields: {
        title: { 'en-US': bookData.title },
        featured: { 'en-US': bookData.isFeatured || false },
        description: { 'en-US': bookData.description },
        publishDate: { 'en-US': bookData.publishDate },
        bookSize: { 'en-US': bookData.size },
        criticalReceptionText: { 'en-US': bookData.description } // Using description as placeholder
      }
    }

    // Create the entry
    const entry = await environment.createEntry('book', entryData)
    console.log(`✅ Created book entry: ${entry.sys.id}`)
    
    // Publish the entry
    const publishedEntry = await entry.publish()
    console.log(`🚀 Published book: ${bookData.title}`)
    
    return publishedEntry
    
  } catch (error) {
    console.error(`❌ Error creating book "${bookData.title}":`, error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

// Example usage - you can call this with any book from your books.json
async function main() {
  const sampleBook = {
    "title": "The Promise",
    "firstName": "Damon",
    "surname": "Galgut", 
    "size": "thick",
    "description": "Booker Prize winner exploring a white South African family's decline over decades",
    "publishDate": "2021-03-15",
    "isFeatured": true
  }
  
  await createBook(sampleBook)
}

// Uncomment to run
// main()

module.exports = { createBook }