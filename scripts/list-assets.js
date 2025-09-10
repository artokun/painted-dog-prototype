const { createClient } = require('contentful-management')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
})

async function listAssets() {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master')
    
    const assets = await environment.getAssets()
    
    console.log('📎 Available assets:')
    assets.items.forEach(asset => {
      if (asset.fields.file && asset.fields.file['en-US']) {
        console.log(`  - ${asset.fields.title['en-US']} (${asset.sys.id})`)
        console.log(`    File: ${asset.fields.file['en-US'].fileName}`)
        console.log(`    URL: ${asset.fields.file['en-US'].url}`)
        console.log('')
      }
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

listAssets()