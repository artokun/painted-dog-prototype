const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
  return await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
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

async function createZooCityBook() {
  try {
    console.log(`📚 Creating "Zoo City" by Lauren Beukes`)
    
    const environment = await getEnvironment()
    
    // 1. Create/Find Lauren Beukes author
    const authorBiography = `Lauren Beukes is a South African novelist, short story writer, journalist and television scriptwriter born on 5 June 1976. She grew up in Johannesburg, South Africa, and has an MA in creative writing from the University of Cape Town.

Before becoming a novelist, Beukes worked as a freelance journalist for ten years, including two years in New York and Chicago, writing about everything from electricity cable thieves to great white sharks, covering topics for magazines ranging from The Sunday Times Lifestyle to Nature Medicine, Colors, The Big Issue and Marie Claire.

She is the award-winning author of six novels, a collection of short stories, a pop history about South African women, and New York Times best-selling comics. Her most notable works include Zoo City (2010), which won the Arthur C. Clarke Award, and The Shining Girls (2013), which was adapted into a television series. Her work has been translated into 23 languages and she has received numerous prestigious awards including the University of Johannesburg Prize, the August Derleth Award for Best Horror, and the RT Thriller of the Year.`

    const authorEntry = await findOrCreateAuthor(environment, 'Lauren Beukes', authorBiography)
    
    // 2. Find or create Urban Fantasy genre
    const genreEntry = await findOrCreateGenre(environment, 'Fiction', 'Urban Fantasy')
    
    // 3. Create price entry
    console.log(`💰 Creating price: $26`)
    const priceEntry = await environment.createEntry('price', {
      fields: {
        text: { 'en-US': 'Paperback' },
        price: { 'en-US': 26 },
        isNew: { 'en-US': false },
        description: { 'en-US': 'The paperback edition of Zoo City features the Arthur C. Clarke Award-winning text about crime, magic, and redemption in Johannesburg.' },
        productInformation: {
          'en-US': {
            isbn10: '0857660551',
            isbn13: '978-0857660558',
            language: 'English',
            dimensions: '4.16 x 6.87 inches (106 x 175 mm)',
            printLength: '416 pages',
            publisher: 'Angry Robot',
            publicationDate: 'December 28, 2010'
          }
        }
      }
    })
    await priceEntry.publish()
    
    // 4. Create featured article link
    console.log(`🔗 Creating featured article link`)
    const articleEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Zoo City: Johannesburg\'s Dark Fantasy' },
        link: { 'en-US': 'https://www.tor.com/2020/05/10/zoo-city-ten-years-later' }
      }
    })
    await articleEntry.publish()
    
    // 5. Create podcast episode link
    console.log(`🔗 Creating podcast episode link`)
    const podcastEntry = await environment.createEntry('link', {
      fields: {
        text: { 'en-US': 'Lauren Beukes on Afrofuturism' },
        link: { 'en-US': 'https://hanselminutes.com/306/creating-science-fiction-with-zoo-city-author-lauren-beukes' }
      }
    })
    await podcastEntry.publish()
    
    // 6. Use XS texture assets (based on 4.16 x 6.87 inches / 106x175mm mapping to XS)
    console.log(`🖼️ Using XS texture assets`)
    const finalFrontTexture = { sys: { id: '7dG9T8tnJwuamBDfBfLoeq' } } // template-front-xs
    const finalSideTexture = { sys: { id: '34nWVAWGx2yKgs8kZz9YBp' } }   // template-side-xs
    console.log('✅ Using XS template textures (108x174mm)')
    
    // 7. Create the main book entry
    console.log(`📖 Creating main book entry`)
    const bookFields = {
      title: { 'en-US': 'Zoo City' },
      featured: { 'en-US': false },
      description: { 
        'en-US': `# Zoo City by Lauren Beukes

Winner of the 2011 Arthur C. Clarke Award, Zoo City is Lauren Beukes' genre-defying urban fantasy set in a reimagined Johannesburg that crackles with magic, crime, and redemption.

Zinzi December is a former journalist and recovering drug addict who has acquired a sloth—and a magical talent for finding lost things. She lives in Zoo City, the festering inner-city neighborhood where people like her are forced to live with their animal companions after committing crimes. It's a dangerous life, but at least it's a life, until a missing persons case turns deadly.

When hired to find a lost teenaged girl, Zinzi's search takes her into the sordid underbelly of Johannesburg's music industry, where she encounters con artists, killers, and the dark heart of the city itself. As she navigates a world of music piracy, Zimbabwean refugees, and drug cartels, Zinzi must confront her own demons while uncovering a conspiracy that threatens everything she holds dear.

Blending hardboiled noir with African magical realism, Zoo City is a powerful exploration of guilt, redemption, and the cost of survival in contemporary South Africa. Beukes creates a vivid, gritty Johannesburg that pulses with energy and danger, offering a fresh take on urban fantasy that examines themes of crime, poverty, and social inequality with unflinching honesty.`
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
      publishDate: { 'en-US': '2010-04-29' },
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
      bookSize: { 'en-US': 'XS' }, // Based on dimension research: 4.16 x 6.87 inches maps to XS
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

["Zoo City: Ten Years Later - Still Sharp, Still Relevant"](https://www.tor.com/2020/05/10/zoo-city-ten-years-later) by Liz Bourke, Tor.com, May 2020

["The Magical Science of Fiction: A Review of Lauren Beukes' Zoo City"](https://brittlepaper.com/2013/07/magical-science-fiction-review-lauren-beukes-zoo-city/) by Brittle Paper, July 2013

["Beukes's energetic noir phantasmagoria crackles with original ideas"](https://www.nytimes.com/books/zoo-city-review) by Jeff VanderMeer, New York Times Book Review, 2011

Zoo City won the 2011 Arthur C. Clarke Award, sparking important discussions about the boundaries between science fiction and fantasy. While some critics debated its genre classification, the consensus was clear: Beukes had created something remarkable. Publisher's Weekly gave it a starred review, praising how Beukes "delivers a thrill ride that gleefully merges narrative styles and tropes, almost single-handedly pulling the 'urban fantasy' subgenre back towards its groundbreaking roots."

The novel was also shortlisted for the 2010 BSFA Award for best novel, the 2011 World Fantasy award, and long-listed for the 2012 International Dublin Literary Award. Critics particularly noted Beukes' ability to ground fantastical elements in the harsh realities of contemporary Johannesburg, creating what Cory Doctorow called "a fabulous outing from an extremely promising writer."

Have you found a review we have excluded? Let us know at __[reviews@painteddogpress.com](mailto:reviews@painteddogpress.com "Reviews")__`
      },
      podcastText: { 
        'en-US': `# Creating Science Fiction with Lauren Beukes

In this episode of Hanselminutes Technology Podcast, Scott Hanselman interviews Lauren Beukes about her creative process following her 2011 Arthur C. Clarke Award win for Zoo City. The conversation explores how Beukes keeps everything organized, when to know when to stop writing, and her work on comics projects.

Beukes discusses her unique approach to worldbuilding, combining the gritty realities of Johannesburg with fantastical elements, and how her background as a journalist influences her fiction writing. She also delves into the themes of guilt, redemption, and social justice that permeate Zoo City, explaining how the novel's magical system serves as a metaphor for the consequences of our actions.

Host: Scott Hanselman
Guest: Lauren Beukes
Duration: 30 minutes`
      }
    }
    
    const bookEntry = await environment.createEntry('book', { fields: bookFields })
    const publishedBook = await bookEntry.publish()
    
    console.log(`🎉 Successfully created "Zoo City" by Lauren Beukes!`)
    console.log(`   Book ID: ${publishedBook.sys.id}`)
    console.log(`   Author ID: ${authorEntry.sys.id}`)
    console.log(`   Genre ID: ${genreEntry.sys.id}`)
    console.log(`   Price ID: ${priceEntry.sys.id}`)
    console.log(`   Article Link ID: ${articleEntry.sys.id}`)
    console.log(`   Podcast Link ID: ${podcastEntry.sys.id}`)
    console.log(`   Size: XS (based on real dimensions 4.16 x 6.87 inches / 106x175mm)`)
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
        researchedSize: 'XS',
        realDimensions: '106 x 175 mm',
        textureAssets: [finalFrontTexture.sys.id, finalSideTexture.sys.id]
      },
      errors: []
    }
    
  } catch (error) {
    console.error(`❌ Failed to create "Zoo City":`, error.message)
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

// Run the script
if (require.main === module) {
  createZooCityBook()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Zoo City creation completed successfully!')
        console.log('📊 Summary:', JSON.stringify(result, null, 2))
      } else {
        console.log('\n❌ Zoo City creation failed!')
        console.log('📊 Error details:', JSON.stringify(result, null, 2))
      }
    })
    .catch(error => {
      console.error('❌ Script execution failed:', error)
      process.exit(1)
    })
}

module.exports = { createZooCityBook }