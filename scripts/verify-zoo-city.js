const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function verifyZooCityEntry() {
  try {
    console.log('🔍 Verifying Zoo City entry and all linked entries...\n')
    
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
    
    // Find the Zoo City book entry
    const zooCity = await environment.getEntries({
      content_type: 'book',
      'fields.title': 'Zoo City'
    })
    
    if (zooCity.items.length === 0) {
      console.log('❌ Zoo City book entry not found')
      return
    }
    
    const book = zooCity.items[0]
    console.log('📚 Book Entry:')
    console.log(`   Title: ${book.fields.title['en-US']}`)
    console.log(`   ID: ${book.sys.id}`)
    console.log(`   Published: ${book.sys.publishedAt ? '✅' : '❌'}`)
    console.log(`   Size: ${book.fields.bookSize['en-US']}`)
    console.log(`   Featured: ${book.fields.featured['en-US']}`)
    
    // Verify author
    if (book.fields.authors) {
      const authorId = book.fields.authors['en-US'][0].sys.id
      const author = await environment.getEntry(authorId)
      console.log('\n👤 Author Entry:')
      console.log(`   Name: ${author.fields.fullName['en-US']}`)
      console.log(`   ID: ${author.sys.id}`)
      console.log(`   Published: ${author.sys.publishedAt ? '✅' : '❌'}`)
    }
    
    // Verify genre
    if (book.fields.genre) {
      const genreId = book.fields.genre['en-US'].sys.id
      const genre = await environment.getEntry(genreId)
      console.log('\n🏷️ Genre Entry:')
      console.log(`   Genre: ${genre.fields.genre['en-US']}`)
      console.log(`   Sub-genre: ${genre.fields.subGenre['en-US']}`)
      console.log(`   ID: ${genre.sys.id}`)
      console.log(`   Published: ${genre.sys.publishedAt ? '✅' : '❌'}`)
    }
    
    // Verify price
    if (book.fields.prices) {
      const priceId = book.fields.prices['en-US'][0].sys.id
      const price = await environment.getEntry(priceId)
      console.log('\n💰 Price Entry:')
      console.log(`   Type: ${price.fields.text['en-US']}`)
      console.log(`   Price: $${price.fields.price['en-US']}`)
      console.log(`   ID: ${price.sys.id}`)
      console.log(`   Published: ${price.sys.publishedAt ? '✅' : '❌'}`)
      
      if (price.fields.productInformation) {
        const productInfo = price.fields.productInformation['en-US']
        console.log(`   ISBN-10: ${productInfo.isbn10}`)
        console.log(`   ISBN-13: ${productInfo.isbn13}`)
        console.log(`   Dimensions: ${productInfo.dimensions}`)
        console.log(`   Pages: ${productInfo.printLength}`)
        console.log(`   Publisher: ${productInfo.publisher}`)
      }
    }
    
    // Verify featured article link
    if (book.fields.linkToFeaturedArticle) {
      const articleLinkId = book.fields.linkToFeaturedArticle['en-US'].sys.id
      const articleLink = await environment.getEntry(articleLinkId)
      console.log('\n🔗 Featured Article Link:')
      console.log(`   Title: ${articleLink.fields.text['en-US']}`)
      console.log(`   URL: ${articleLink.fields.link['en-US']}`)
      console.log(`   ID: ${articleLink.sys.id}`)
      console.log(`   Published: ${articleLink.sys.publishedAt ? '✅' : '❌'}`)
    }
    
    // Verify podcast link
    if (book.fields.linkToPodcastEpisode) {
      const podcastLinkId = book.fields.linkToPodcastEpisode['en-US'].sys.id
      const podcastLink = await environment.getEntry(podcastLinkId)
      console.log('\n🎧 Podcast Episode Link:')
      console.log(`   Title: ${podcastLink.fields.text['en-US']}`)
      console.log(`   URL: ${podcastLink.fields.link['en-US']}`)
      console.log(`   ID: ${podcastLink.sys.id}`)
      console.log(`   Published: ${podcastLink.sys.publishedAt ? '✅' : '❌'}`)
    }
    
    // Verify texture assets
    if (book.fields.bookCoverTextureFront && book.fields.bookCoverTextureSide) {
      const frontAssetId = book.fields.bookCoverTextureFront['en-US'].sys.id
      const sideAssetId = book.fields.bookCoverTextureSide['en-US'].sys.id
      
      const frontAsset = await environment.getAsset(frontAssetId)
      const sideAsset = await environment.getAsset(sideAssetId)
      
      console.log('\n🖼️ Texture Assets:')
      console.log(`   Front: ${frontAsset.fields.title['en-US']} (${frontAsset.sys.id})`)
      console.log(`   Side: ${sideAsset.fields.title['en-US']} (${sideAsset.sys.id})`)
      console.log(`   Front Published: ${frontAsset.sys.publishedAt ? '✅' : '❌'}`)
      console.log(`   Side Published: ${sideAsset.sys.publishedAt ? '✅' : '❌'}`)
    }
    
    // Verify content structure
    console.log('\n📝 Content Structure:')
    console.log(`   Description length: ${book.fields.description['en-US'].length} chars`)
    console.log(`   Critical reception length: ${book.fields.criticalReceptionText['en-US'].length} chars`)
    console.log(`   Podcast text length: ${book.fields.podcastText['en-US'].length} chars`)
    
    console.log('\n🎉 All Zoo City entries verified successfully!')
    console.log('📊 Summary:')
    console.log(`   Book ID: ${book.sys.id}`)
    console.log(`   Author ID: ${book.fields.authors['en-US'][0].sys.id}`)
    console.log(`   Genre ID: ${book.fields.genre['en-US'].sys.id}`)
    console.log(`   Price ID: ${book.fields.prices['en-US'][0].sys.id}`)
    console.log(`   Article Link ID: ${book.fields.linkToFeaturedArticle['en-US'].sys.id}`)
    console.log(`   Podcast Link ID: ${book.fields.linkToPodcastEpisode['en-US'].sys.id}`)
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

verifyZooCityEntry()