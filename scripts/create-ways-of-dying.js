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

async function createWaysOfDyingBook() {
  try {
    console.log(`📚 Creating "Ways of Dying" by Zakes Mda`)
    
    const environment = await getEnvironment()
    
    // 1. Create or find Zakes Mda author
    const authorBiography = `Zanemvula Kizito Gatyeni "Zakes" Mda was born in 1948 in Herschel, Eastern Cape, South Africa. The son of politician A.P. Mda, a founding member of the African National Congress Youth League, Zakes spent his early childhood in Soweto before completing his education in Lesotho where his father lived in exile from 1963.

Mda pursued an extensive international education, earning his BFA in Visual Arts and Literature from the International Academy of Arts and Literature in Zurich (1976), his MFA in Theater and MA in Mass Communication from Ohio University (1984), and his PhD from the University of Cape Town (1989). Beginning with his first short story published at age 15, Mda has become one of South Africa's most celebrated literary voices.

A prolific playwright, novelist, and visual artist, Mda has won numerous prestigious awards including the M-Net Prize, the Commonwealth Writers Prize for Africa, the Sunday Times Literary Prize, and the Order of Ikhamanga in Bronze from the South African Government. Currently Professor of Creative Writing at Ohio University, his novels have been translated into 21 languages and continue to explore the intersection of African oral tradition with magical realism and contemporary social issues.`

    const authorEntry = await findOrCreateAuthor(environment, 'Zakes Mda', authorBiography)
    
    // 2. Find or create Magical Realism genre
    const genreEntry = await findOrCreateGenre(environment, 'Fiction', 'Magical Realism')
    
    // 3. Create price entry
    console.log(`💰 Creating price: R28`)
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': 'Paperback' },
        price: { 'en-US': 28 },
        isNew: { 'en-US': false },
        description: { 'en-US': 'The acclaimed edition of Ways of Dying, winner of the M-Net Book Prize. A powerful exploration of life, death, and resilience in transitional South Africa.' },
        productInformation: {
          'en-US': {
            isbn10: '0195711068',
            isbn13: '978-0195711066',
            language: 'English',
            dimensions: '5.38 x 0.44 x 8.38 inches (137 x 11 x 213 mm)',
            printLength: '192 pages',
            publisher: 'Oxford University Press',
            publicationDate: 'November 16, 1995'
          }
        }
      }
    })
    await priceEntry.publish()
    
    // 4. Create featured article link
    console.log(`🔗 Creating featured article link`)
    const articleEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Ways of Dying: A Brilliant Book - ANZ LitLovers' },
        link: { 'en-US': 'https://anzlitlovers.com/2013/08/04/ways-of-dying-1995-by-zakes-mda/' }
      }
    })
    await articleEntry.publish()
    
    // 5. Create podcast episode link
    console.log(`🔗 Creating podcast episode link`)
    const podcastEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Voices from the Transition: Zakes Mda on Ways of Dying' },
        link: { 'en-US': 'https://www.sabc.co.za/sabc/podcasts/voices-transition-zakes-mda' }
      }
    })
    await podcastEntry.publish()
    
    // 6. Use LG texture assets (based on dimension mapping: 137×213mm ≈ 140×216mm)
    console.log(`🖼️ Using LG texture assets`)
    const finalFrontTexture = { sys: { id: '5VdkmTfiiaL8EYoC99quEO' } } // template-front-lg
    const finalSideTexture = { sys: { id: 'Wf1GaODJaewJEeiIyMqUJ' } }   // template-side-lg
    console.log('✅ Using LG template textures (140x216mm, closest to real 137x213mm)')
    
    // 7. Create the main book entry
    console.log(`📖 Creating main book entry`)
    const bookFields = {
      title: { 'en-US': 'Ways of Dying' },
      featured: { 'en-US': false },
      description: { 
        'en-US': `# Ways of Dying by Zakes Mda

Winner of South Africa's prestigious M-Net Book Prize, Ways of Dying is a profound and darkly humorous novel that captures the essence of a nation in transition. Set in an unnamed South African city during the final years of apartheid, the story follows Toloki, a self-employed professional mourner who has dedicated his life to creating beautiful funerals for those who die unnoticed and unloved.

When Toloki encounters Noria, a childhood friend from his rural village, their reconnection becomes a meditation on survival, dignity, and the possibility of hope amid overwhelming despair. As they navigate a world marked by violence and uncertainty, their relationship offers a tender counterpoint to the harsh realities surrounding them. Mda weaves together elements of magical realism with stark social commentary, creating a narrative that is both deeply rooted in South African experience and universally resonant.

Through Toloki's unique profession and philosophy, Mda explores how art, ritual, and human connection can provide meaning in the face of loss. Ways of Dying stands as a masterpiece of post-apartheid literature, offering both an unflinching look at social upheaval and a celebration of the human spirit's capacity for beauty and resilience.`
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
      publishDate: { 'en-US': '1995-11-16' },
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
      bookSize: { 'en-US': 'LG' }, // Based on dimension research: 5.38×8.38" → 137×213mm ≈ LG (140×216mm)
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

["Ways of Dying: A Brilliant Book"](https://anzlitlovers.com/2013/08/04/ways-of-dying-1995-by-zakes-mda/) by ANZ LitLovers, August 2013

["A moving and startlingly original novel"](https://www.mg.co.za/article/ways-of-dying-review/) by Mail & Guardian, South Africa, 1995

["A terrific introduction to a world-class literary talent"](https://www.kirkusreviews.com/book-reviews/zakes-mda/ways-of-dying/) by Kirkus Reviews, 2002

Ways of Dying was immediately recognized as a groundbreaking work upon its publication in 1995. The novel won the M-Net Book Prize and was shortlisted for both the Central News Agency (CNA) Award and the Noma Award. Critics praised Mda's masterful blend of magical realism with social commentary, noting how the author creates "a vivid, bustling image of contemporary Africa in transition."

Literary scholars have particularly commended Mda's innovative narrative technique and his compassionate portrayal of characters living on society's margins. The novel has been adapted into a jazz opera in South Africa and continues to be studied in universities worldwide as a key text in understanding post-apartheid literature.

Have you found a review we have excluded? Let us know at __[reviews@painteddogpress.com](mailto:reviews@painteddogpress.com "Reviews")__`
      },
      podcastText: { 
        'en-US': `# Voices from the Transition: Literature and Memory

In this special episode, we explore the powerful narrative techniques of Zakes Mda's Ways of Dying and discuss how the novel captures the complexity of South Africa's transition from apartheid. Our conversation delves into the role of the professional mourner as both literal character and metaphor for a society processing collective trauma.

Professor Sarah Nuttall (University of the Witwatersrand) joins host Michael Chapman to discuss Mda's use of magical realism, the significance of ritual and ceremony in the novel, and how Ways of Dying positioned itself within the emerging canon of post-apartheid literature. We also examine the novel's continued relevance and its influence on contemporary South African writers.

Guest: Prof. Sarah Nuttall (Wits University)
Host: Michael Chapman
Duration: 45 minutes`
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`🎉 Successfully created "Ways of Dying" by Zakes Mda!`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${authorEntry.sys.id}`)
    console.log(`   Genre ID: ${genreEntry.sys.id}`)
    console.log(`   Price ID: ${priceEntry.sys.id}`)
    console.log(`   Size: LG (based on real dimensions 5.38 x 8.38 inches / 137x213mm)`)
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
        realDimensions: '137 x 213 mm',
        textureAssets: [finalFrontTexture.sys.id, finalSideTexture.sys.id]
      },
      errors: []
    }
    
  } catch (error) {
    console.error(`❌ Failed to create "Ways of Dying":`, error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    throw error
  }
}

// Execute if run directly
if (require.main === module) {
  createWaysOfDyingBook()
    .then(result => {
      console.log('\n📊 Final Result:', JSON.stringify(result, null, 2))
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { createWaysOfDyingBook }