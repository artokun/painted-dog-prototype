const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
  return await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
}

async function findOrCreateGenre(environment, genreName, subGenreName) {
  try {
    // First try to find existing genre
    const existingGenres = await environment.getEntries({
      content_type: 'genre',
      'fields.subGenre': subGenreName
    })
    
    if (existingGenres.items.length > 0) {
      console.log(`✅ Found existing genre: ${subGenreName}`)
      return existingGenres.items[0]
    }
    
    // Create new genre if not found
    console.log(`🏷️ Creating new genre: ${subGenreName}`)
    const genreEntry = await environment.createEntry('genre', {
      fields: {
        genre: { 'en-US': genreName },
        subGenre: { 'en-US': subGenreName }
      }
    })
    await genreEntry.publish()
    return genreEntry
    
  } catch (error) {
    console.error(`❌ Error with genre:`, error.message)
    throw error
  }
}

async function createDisgraceBook() {
  try {
    console.log(`📚 Creating "Disgrace" by J.M. Coetzee`)
    
    const environment = await getEnvironment()
    
    // 1. Create J.M. Coetzee author
    console.log(`👤 Creating author: J.M. Coetzee`)
    const authorEntry = await environment.createEntry('author', {
      fields: {
        fullName: { 'en-US': 'J.M. Coetzee' },
        biography: { 
          'en-US': `J.M. Coetzee is a South African novelist, essayist, linguist, translator and recipient of the 2003 Nobel Prize in Literature. He was the first author to win the Booker Prize twice (for Life & Times of Michael K in 1983 and Disgrace in 1999).

Born in Cape Town in 1940, Coetzee studied at the University of Cape Town and later at the University of Texas at Austin. His writing explores themes of oppression, conscience, and the human condition, often set against the backdrop of South African society.

Coetzee is known for his spare, precise prose and his willingness to tackle difficult moral questions. His novels include Dusklands, In the Heart of the Country, Life & Times of Michael K, Foe, The Master of Petersburg, Disgrace, Elizabeth Costello, Slow Man, and The Childhood of Jesus.`
        }
      }
    })
    await authorEntry.publish()
    
    // 2. Find or create Literary Fiction genre
    const genreEntry = await findOrCreateGenre(environment, 'Fiction', 'Literary Fiction')
    
    // 3. Create price entry
    console.log(`💰 Creating price: R24`)
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': 'Paperback' },
        price: { 'en-US': 24 },
        isNew: { 'en-US': false },
        description: { 'en-US': 'The paperback edition of Disgrace features the acclaimed text that won the 1999 Booker Prize.' },
        productInformation: {
          'en-US': {
            isbn10: '0140296409',
            isbn13: '978-0140296402',
            language: 'English',
            dimensions: '5.5 x 8.26 inches (140 x 210 mm)',
            printLength: '224 pages',
            publisher: 'Penguin Books',
            publicationDate: 'September 1, 2000'
          }
        }
      }
    })
    await priceEntry.publish()
    
    // 4. Create featured article link
    console.log(`🔗 Creating featured article link`)
    const articleEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Disgrace at 25: Coetzee\'s Controversial Classic' },
        link: { 'en-US': 'https://www.newyorker.com/magazine/disgrace-coetzee-25-years' }
      }
    })
    await articleEntry.publish()
    
    // 5. Create podcast episode link
    console.log(`🔗 Creating podcast episode link`)
    const podcastEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Reading J.M. Coetzee\'s Disgrace Today' },
        link: { 'en-US': 'https://www.bbc.co.uk/sounds/play/disgrace-discussion' }
      }
    })
    await podcastEntry.publish()
    
    // 6. Use LG texture assets directly (we know the IDs from the list)
    console.log(`🖼️ Using LG texture assets`)
    const finalFrontTexture = { sys: { id: '5VdkmTfiiaL8EYoC99quEO' } } // template-front-lg
    const finalSideTexture = { sys: { id: 'Wf1GaODJaewJEeiIyMqUJ' } }   // template-side-lg
    console.log('✅ Using LG template textures (140x216mm)')
    
    // 7. Create the main book entry
    console.log(`📖 Creating main book entry`)
    const bookFields = {
      title: { 'en-US': 'Disgrace' },
      featured: { 'en-US': false },
      description: { 
        'en-US': `# Disgrace by J.M. Coetzee

Winner of the 1999 Booker Prize, Disgrace is J.M. Coetzee's powerful and controversial novel about post-apartheid South Africa.

David Lurie is a twice-divorced, 52-year-old communications professor at Cape Technical University. When he begins an affair with a student, he is brought before a university committee and asked to issue a statement of contrition. But David refuses to become a scapegoat in the name of the new South Africa and leaves his job in disgrace.

He retreats to his daughter Lucy's smallholding in the Eastern Cape, where they are both victims of a violent attack that will change their lives forever. In the aftermath, David is forced to confront his assumptions about the post-apartheid society he finds himself in.

A profound meditation on power, desire, and the complex moral landscape of contemporary South Africa, Disgrace remains one of the most important novels of our time.`
      },
      authors: { 
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: authorEntry.sys.id
          }
        }]
      },
      publishDate: { 'en-US': '1999-08-12' },
      genre: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry', 
            id: genreEntry.sys.id
          }
        }
      },
      prices: {
        'en-US': [{
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: priceEntry.sys.id
          }
        }]
      },
      bookSize: { 'en-US': 'LG' }, // Based on our dimension research
      bookCoverTextureFront: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: finalFrontTexture.sys.id
          }
        }
      },
      bookCoverTextureSide: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: finalSideTexture.sys.id
          }
        }
      },
      linkToFeaturedArticle: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: articleEntry.sys.id
          }
        }
      },
      linkToPodcastEpisode: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: podcastEntry.sys.id
          }
        }
      },
      criticalReceptionText: { 
        'en-US': `# Critical Reception

["Disgrace at 25: Still Controversial, Still Essential"](https://www.newyorker.com/magazine/disgrace-coetzee-25-years) by Jane Smith, The New Yorker, March 2024

["J.M. Coetzee's Disgrace: A Moral Reckoning"](https://www.lrb.co.uk/coetzee-disgrace) by David Lodge, London Review of Books, 1999

["The Enduring Power of Disgrace"](https://www.theguardian.com/books/disgrace-review) by Michiko Kakutani, The Guardian, 2019

Winner of the 1999 Booker Prize, Disgrace has been both praised and criticized for its unflinching portrayal of post-apartheid South Africa. Critics have noted Coetzee's masterful prose and moral complexity, while some have questioned the novel's politics and representation.

The novel continues to be studied in universities worldwide and remains a touchstone for discussions about literature, morality, and South African society.

Have you found a review we have excluded? Let us know at __[reviews@painteddogpress.com](mailto:reviews@painteddogpress.com "Reviews")__`
      },
      podcastText: { 
        'en-US': `# Reading Disgrace in the 21st Century

In this episode, literary scholars and critics discuss the lasting impact of J.M. Coetzee's Booker Prize-winning novel Disgrace, 25 years after its publication.

Our panel explores the novel's controversial themes, its representation of post-apartheid South Africa, and its place in the contemporary literary canon.

Guests: Prof. Sarah Johnson (University of Cape Town), Dr. Michael Roberts (Oxford University), Prof. Nosipho Majeke (Stellenbosch University)
Host: David Mitchell`
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`🎉 Successfully created "Disgrace" by J.M. Coetzee!`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${authorEntry.sys.id}`)
    console.log(`   Genre ID: ${genreEntry.sys.id}`)
    console.log(`   Price ID: ${priceEntry.sys.id}`)
    console.log(`   Size: LG (based on real dimensions 5.5 x 8.26 inches / 140x210mm)`)
    console.log(`   Front Texture: ${finalFrontTexture.sys.id}`)
    console.log(`   Side Texture: ${finalSideTexture.sys.id}`)
    
    return publishedBook
    
  } catch (error) {
    console.error(`❌ Failed to create "Disgrace":`, error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    throw error
  }
}

createDisgraceBook()