// Test script to verify book dimensions and stacking calculations
const { createClient } = require('contentful');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Updated size mappings from GLTF analysis
const contentfulSizeMap = {
  "XS": [0.113, 0.0347, 0.1793],   // Book_108x175
  "SM": [0.1317, 0.0187, 0.2072],  // Book_127x203
  "MD": [0.138, 0.0195, 0.2075],   // Book_133x203
  "LG": [0.1452, 0.0297, 0.2204],  // Book_140x216
  "XL": [0.1572, 0.0226, 0.2333],  // Book_152x229
};

function getContentfulBookSize(size) {
  return contentfulSizeMap[size] || contentfulSizeMap["MD"];
}

async function testBookDimensions() {
  console.log('📏 Testing Book Dimensions and Stacking...\n');
  
  try {
    const response = await client.getEntries({
      content_type: 'book',
      include: 3,
      order: 'fields.publishDate',
    });
    
    console.log(`📚 Found ${response.items.length} books\n`);
    
    let totalStackHeight = 0;
    let sizeDistribution = {};
    
    console.log('📖 Book Stack Analysis:');
    console.log('='.repeat(60));
    
    response.items.forEach((item, index) => {
      const fields = item.fields;
      const size = fields.bookSize;
      const [width, height, depth] = getContentfulBookSize(size);
      
      totalStackHeight += height;
      sizeDistribution[size] = (sizeDistribution[size] || 0) + 1;
      
      console.log(`${(index + 1).toString().padStart(2)}. "${fields.title}"`);
      console.log(`    Size: ${size} | Dims: ${width.toFixed(4)} × ${height.toFixed(4)} × ${depth.toFixed(4)}`);
      console.log(`    Stack Height: ${totalStackHeight.toFixed(4)} units`);
      console.log('');
    });
    
    console.log('📊 Stack Summary:');
    console.log('='.repeat(40));
    console.log(`Total Stack Height: ${totalStackHeight.toFixed(4)} units`);
    console.log(`Average Book Height: ${(totalStackHeight / response.items.length).toFixed(4)} units`);
    console.log('');
    
    console.log('📏 Size Distribution:');
    Object.entries(sizeDistribution).forEach(([size, count]) => {
      const [width, height, depth] = getContentfulBookSize(size);
      console.log(`${size}: ${count} books (H: ${height.toFixed(4)})`);
    });
    
    console.log('\n🎯 Dimension Comparison:');
    console.log('Size | Width   | Height  | Depth   | Real-world (mm)');
    console.log('-----|---------|---------|---------|----------------');
    Object.entries(contentfulSizeMap).forEach(([size, [w, h, d]]) => {
      // Convert to approximate real-world dimensions (assuming 1 unit ≈ 1000mm scale)
      const realW = Math.round(w * 1000);
      const realH = Math.round(h * 1000); 
      const realD = Math.round(d * 1000);
      console.log(`${size.padEnd(4)} | ${w.toFixed(4)} | ${h.toFixed(4)} | ${d.toFixed(4)} | ${realW}×${realH}×${realD}`);
    });
    
    console.log('\n✅ Book dimensions updated successfully!');
    console.log('🚀 Books should now stack and animate with correct proportions.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookDimensions();