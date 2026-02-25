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

async function findOrCreateAuthor(environment, fullName, biography) {
  try {
    // First try to find existing author
    const existingAuthors = await environment.getEntries({
      content_type: 'author',
      'fields.fullName': fullName
    })
    
    if (existingAuthors.items.length > 0) {
      console.log(`✅ Found existing author: ${fullName}`)
      return existingAuthors.items[0]
    }
    
    // Create new author if not found
    console.log(`👤 Creating new author: ${fullName}`)
    const authorEntry = await environment.createEntry('author', {
      fields: {
        fullName: { 'en-US': fullName },
        biography: { 'en-US': biography }
      }
    })
    await authorEntry.publish()
    return authorEntry
    
  } catch (error) {
    console.error(`❌ Error with author:`, error.message)
    throw error
  }
}

async function createTriomfBook() {
  try {
    console.log(`📚 Creating "Triomf" by Marlene van Niekerk`)
    
    const environment = await getEnvironment()
    
    // 1. Create or find Marlene van Niekerk author
    const authorBiography = `Marlene van Niekerk is one of South Africa's most celebrated contemporary writers, born on November 10, 1954, on Tygerhoek farm near Caledon in the Western Cape. She is a novelist, poet, and academic who writes primarily in Afrikaans and teaches at Stellenbosch University's Department of Afrikaans and Dutch Literature.

Van Niekerk studied languages and philosophy at Stellenbosch University, where she began her literary career as a student with her debut poetry collection Sprokkelster (1977), which won both the Eugène Marais Prize and the Ingrid Jonker Prize. She later studied directing in Germany and philosophy in Holland, obtaining a doctorate with a thesis on Claude Lévi-Strauss and Paul Ricoeur.

Her literary works explore themes of family, power dynamics, apartheid's legacy, and social inequalities through satirical and often darkly comic narratives. Her most famous novels include Triomf (1994), which won the M-Net Prize, CNA Literary Award, and the prestigious Noma Award for best book in Africa, and Agaat (2004), which won seven South African literary awards. In 2011, she was awarded the Order of Ikhamanga (Silver) by the South African president for her outstanding contribution to literature and culture.`

    const authorEntry = await findOrCreateAuthor(environment, 'Marlene van Niekerk', authorBiography)
    
    // 2. Find or create Dark Comedy genre
    const genreEntry = await findOrCreateGenre(environment, 'Fiction', 'Dark Comedy')
    
    // 3. Create price entry
    console.log(`💰 Creating price: $28`)
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': 'Paperback' },
        price: { 'en-US': 28 },
        isNew: { 'en-US': false },
        description: { 'en-US': 'The acclaimed English translation by Leon de Kock, winner of multiple South African literary awards.' },
        productInformation: {
          'en-US': {
            isbn10: '1585676497',
            isbn13: '978-1585676491',
            language: 'English',
            dimensions: '8.75 x 5.75 inches (22.23 x 14.61 cm)',
            printLength: '528 pages',
            publisher: 'The Overlook Press',
            publicationDate: 'March 29, 2005'
          }
        }
      }
    })
    await priceEntry.publish()
    
    // 4. Create featured article link
    console.log(`🔗 Creating featured article link`)
    const articleEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Triomf: A Scatological Black Satire' },
        link: { 'en-US': 'https://www.complete-review.com/reviews/safrica/vniekm.htm' }
      }
    })
    await articleEntry.publish()
    
    // 5. Create podcast episode link
    console.log(`🔗 Creating podcast episode link`)
    const podcastEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Reading Marlene van Niekerk\'s Triomf' },
        link: { 'en-US': 'https://www.thewhitereview.org/feature/interview-with-marlene-van-niekerk/' }
      }
    })
    await podcastEntry.publish()
    
    // 6. Use LG texture assets (based on dimensions 8.75" x 5.75" → LG size)
    console.log(`🖼️ Using LG texture assets`)
    const finalFrontTexture = { sys: { id: '5VdkmTfiiaL8EYoC99quEO' } } // template-front-lg
    const finalSideTexture = { sys: { id: 'Wf1GaODJaewJEeiIyMqUJ' } }   // template-side-lg
    console.log('✅ Using LG template textures (140x216mm)')
    
    // 7. Create the main book entry
    console.log(`📖 Creating main book entry`)
    const bookFields = {
      title: { 'en-US': 'Triomf' },
      featured: { 'en-US': false },
      description: { 
        'en-US': `# Triomf by Marlene van Niekerk

Winner of the M-Net Prize, CNA Literary Award, and the prestigious Noma Award for best book in Africa, Triomf is a darkly comic masterpiece that exposes the grotesque reality of poor white Afrikaner life in the dying days of apartheid.

Set in the months leading up to South Africa's first democratic election in 1994, the novel follows the dysfunctional Benade family—Mol, her brothers Treppie and Pop, and her son Lambert—living in a government house in Triomf, a neighborhood built on the ruins of the destroyed black township of Sophiatown. As the family struggles with poverty, alcoholism, and shocking secrets, their world becomes a microcosm of a crumbling system built on racial oppression.

Van Niekerk's unflinching satire reveals how apartheid's supposed beneficiaries were often its most tragic victims, trapped in cycles of ignorance, violence, and degradation. With brilliant dark humor and uncompromising honesty, Triomf stands as one of the most important South African novels of the 1990s—a work that dared to examine the underclass that apartheid was meant to protect while laying bare the moral bankruptcy of the entire system.`
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
      publishDate: { 'en-US': '1994-01-01' },
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
      bookSize: { 'en-US': 'LG' }, // Based on dimension research: 8.75" x 5.75" → LG
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

["A scatological black satire... Triomf may be the signal Afrikaans novel of the 1990s"](https://www.complete-review.com/reviews/safrica/vniekm.htm) - The Washington Post

["A daring, vicious and hilarious flight of imagination"](https://www.complete-review.com/reviews/safrica/vniekm.htm) - The Washington Post

["A world-class tragicomic novel, the kind of book that stabs at your heart while it has you rolling on the floor"](https://www.complete-review.com/reviews/safrica/vniekm.htm) - The New York Times Book Review

Triomf was universally acclaimed as a groundbreaking work of post-apartheid literature when it was published in 1994. Critics praised van Niekerk's fearless examination of poor white Afrikaner culture and her ability to find both humor and tragedy in the most degraded circumstances. The novel's unflinching portrayal of incest, violence, and ignorance as the logical extension of apartheid's racial policies made it both controversial and essential reading.

The book's translation into English by Leon de Kock brought international recognition, with critics noting its importance as "possibly the first truly post-apartheid novel by a white writer deserving the description." The novel continues to be studied in universities worldwide as a crucial text for understanding the complex legacy of apartheid.

Have you found a review we have excluded? Let us know at reviews@painteddogpress.com`
      },
      podcastText: { 
        'en-US': `# Dark Comedy and Social Critique: Understanding Triomf

In this compelling discussion, literary scholars explore Marlene van Niekerk's controversial masterpiece Triomf and its unflinching portrayal of poor white Afrikaner life during apartheid's final days.

Our panel examines how van Niekerk uses dark humor to expose the grotesque reality of apartheid's supposed beneficiaries, discussing the novel's satirical techniques and its place in South African literature. The conversation delves into the book's shocking revelations about family dysfunction, social decay, and the moral bankruptcy of racial oppression.

Guests discuss the novel's international reception, its translation challenges, and its continuing relevance as a window into one of the most disturbing chapters of South African history.`
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`🎉 Successfully created "Triomf" by Marlene van Niekerk!`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${authorEntry.sys.id}`)
    console.log(`   Genre ID: ${genreEntry.sys.id}`)
    console.log(`   Price ID: ${priceEntry.sys.id}`)
    console.log(`   Size: LG (based on real dimensions 8.75 x 5.75 inches / 22.23x14.61cm)`)
    console.log(`   Front Texture: ${finalFrontTexture.sys.id}`)
    console.log(`   Side Texture: ${finalSideTexture.sys.id}`)
    
    return {
      success: true,
      bookId: publishedBook.sys.id,
      linkedEntries: {
        authorId: authorEntry.sys.id,
        genreId: genreEntry.sys.id,
        priceIds: [priceEntry.sys.id],
        linkIds: [articleEntry.sys.id, podcastEntry.sys.id]
      },
      metadata: {
        researchedSize: 'LG',
        realDimensions: '223mm x 146mm',
        textureAssets: [finalFrontTexture.sys.id, finalSideTexture.sys.id]
      },
      errors: []
    }
    
  } catch (error) {
    console.error(`❌ Failed to create "Triomf":`, error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    return {
      success: false,
      bookId: null,
      linkedEntries: {},
      metadata: {},
      errors: [error.message]
    }
  }
}

if (require.main === module) {
  createTriomfBook()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Book creation completed successfully!')
        console.log(JSON.stringify(result, null, 2))
      } else {
        console.log('\n❌ Book creation failed!')
        console.log(JSON.stringify(result, null, 2))
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error)
      process.exit(1)
    })
}

module.exports = { createTriomfBook }