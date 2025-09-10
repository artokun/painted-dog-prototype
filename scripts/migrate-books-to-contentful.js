const { createClient } = require('contentful-management')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
  return await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
}

async function createAuthor(environment, firstName, surname) {
  try {
    const fullName = `${firstName} ${surname}`
    console.log(`👤 Creating author: ${fullName}`)
    
    const authorEntry = await environment.createEntry('author', {
      fields: {
        fullName: { 'en-US': fullName },
        biography: { 'en-US': `Biography for ${fullName}` } // Placeholder
      }
    })
    
    const publishedAuthor = await authorEntry.publish()
    console.log(`✅ Created author: ${fullName}`)
    return publishedAuthor
    
  } catch (error) {
    console.error(`❌ Error creating author:`, error.message)
    throw error
  }
}

async function createGenre(environment, genreName) {
  try {
    console.log(`🏷️ Creating genre: ${genreName}`)
    
    const genreEntry = await environment.createEntry('genre', {
      fields: {
        genre: { 'en-US': genreName.split(' - ')[0] || 'Fiction' },
        subGenre: { 'en-US': genreName.split(' - ')[1] || genreName }
      }
    })
    
    const publishedGenre = await genreEntry.publish()
    console.log(`✅ Created genre: ${genreName}`)
    return publishedGenre
    
  } catch (error) {
    console.error(`❌ Error creating genre:`, error.message)
    throw error
  }
}

async function createLink(environment, linkData) {
  try {
    console.log(`🔗 Creating link: ${linkData.content}`)
    
    const linkEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': linkData.content },
        link: { 'en-US': linkData.href }
      }
    })
    
    const publishedLink = await linkEntry.publish()
    console.log(`✅ Created link: ${linkData.content}`)
    return publishedLink
    
  } catch (error) {
    console.error(`❌ Error creating link:`, error.message)
    throw error
  }
}

async function createPrice(environment, price) {
  try {
    console.log(`💰 Creating price: R${price}`)
    
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': `R${price}` },
        price: { 'en-US': price },
        description: { 'en-US': 'Standard pricing' }
      }
    })
    
    const publishedPrice = await priceEntry.publish()
    console.log(`✅ Created price: R${price}`)
    return publishedPrice
    
  } catch (error) {
    console.error(`❌ Error creating price:`, error.message)
    throw error
  }
}

async function createBookFromJSON(bookData) {
  try {
    console.log(`\n📚 Creating book: "${bookData.title}" by ${bookData.firstName} ${bookData.surname}`)
    
    const environment = await getEnvironment()
    
    // Create related entries first
    const author = await createAuthor(environment, bookData.firstName, bookData.surname)
    const genre = await createGenre(environment, bookData.genre)
    const price = await createPrice(environment, bookData.price)
    
    // Create links if they exist
    const links = []
    if (bookData.featuredArticle) {
      const articleLink = await createLink(environment, bookData.featuredArticle)
      links.push(articleLink)
    }
    if (bookData.featuredPodcastEpisode) {
      const podcastLink = await createLink(environment, bookData.featuredPodcastEpisode)
      links.push(podcastLink)
    }
    
    // Create the book entry
    const bookFields = {
      title: { 'en-US': bookData.title },
      featured: { 'en-US': bookData.isFeatured || false },
      description: { 'en-US': bookData.description },
      authors: { 
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: author.sys.id
          }
        }]
      },
      publishDate: { 'en-US': bookData.publishDate },
      genre: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry', 
            id: genre.sys.id
          }
        }
      },
      prices: {
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: price.sys.id
          }
        }]
      },
      bookSize: { 'en-US': bookData.size },
      criticalReceptionText: { 'en-US': bookData.description }
    }
    
    // Add links if they exist
    if (links.length > 0 && bookData.featuredArticle) {
      bookFields.linkToFeaturedArticle = {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: links[0].sys.id
          }
        }
      }
    }
    
    if (links.length > 1 && bookData.featuredPodcastEpisode) {
      bookFields.linkToPodcastEpisode = {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: links[1].sys.id
          }
        }
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`🎉 Successfully created book: "${bookData.title}"`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${author.sys.id}`)
    console.log(`   Genre ID: ${genre.sys.id}`)
    console.log(`   Price ID: ${price.sys.id}`)
    
    return publishedBook
    
  } catch (error) {
    console.error(`❌ Failed to create book "${bookData.title}":`, error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    throw error
  }
}

async function migrateAllBooks() {
  try {
    const booksPath = path.join(process.cwd(), 'public', 'books.json')
    const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'))
    
    console.log(`🚀 Starting migration of ${booksData.length} books to Contentful...`)
    
    for (let i = 0; i < booksData.length; i++) {
      const book = booksData[i]
      console.log(`\n[${i + 1}/${booksData.length}] Processing: ${book.title}`)
      
      try {
        await createBookFromJSON(book)
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Skipping book "${book.title}" due to error`)
      }
    }
    
    console.log(`\n🎉 Migration completed!`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

// Export functions for individual use
module.exports = {
  createBookFromJSON,
  migrateAllBooks
}

// Allow running specific functions
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'migrate-all') {
    migrateAllBooks()
  } else if (command === 'single') {
    // Example: node migrate-books-to-contentful.js single "The Promise"
    const bookTitle = process.argv[3]
    if (bookTitle) {
      const booksPath = path.join(process.cwd(), 'public', 'books.json')
      const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'))
      const book = booksData.find(b => b.title === bookTitle)
      
      if (book) {
        createBookFromJSON(book)
      } else {
        console.error(`Book "${bookTitle}" not found in books.json`)
      }
    } else {
      console.error('Please provide a book title')
    }
  } else {
    console.log('Usage:')
    console.log('  node migrate-books-to-contentful.js migrate-all')
    console.log('  node migrate-books-to-contentful.js single "Book Title"')
  }
}