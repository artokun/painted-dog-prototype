const fs = require('fs');
const path = require('path');

// Function to read and parse GLTF files
function analyzeGLTFDimensions() {
  const modelsDir = path.join(__dirname, '../public/models');
  const gltfFiles = [
    'Book_XS.gltf',
    'Book_SM.gltf', 
    'Book_MD.gltf',
    'Book_LG.gltf',
    'Book_XL.gltf'
  ];

  console.log('📏 Analyzing GLTF Model Dimensions...\n');

  const results = {};

  gltfFiles.forEach(filename => {
    const filePath = path.join(modelsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filename}`);
      return;
    }

    try {
      const gltfData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Extract size from filename
      const size = filename.replace('Book_', '').replace('.gltf', '');
      
      console.log(`📖 ${size} (${filename}):`);
      
      // Check if there are meshes with bounding box info
      if (gltfData.meshes && gltfData.meshes.length > 0) {
        const mesh = gltfData.meshes[0];
        
        // Look for accessors that might contain position data
        if (gltfData.accessors && mesh.primitives) {
          let minBounds = null;
          let maxBounds = null;
          
          mesh.primitives.forEach(primitive => {
            if (primitive.attributes && primitive.attributes.POSITION !== undefined) {
              const positionAccessor = gltfData.accessors[primitive.attributes.POSITION];
              if (positionAccessor.min && positionAccessor.max) {
                if (!minBounds) {
                  minBounds = [...positionAccessor.min];
                  maxBounds = [...positionAccessor.max];
                } else {
                  // Expand bounds
                  for (let i = 0; i < 3; i++) {
                    minBounds[i] = Math.min(minBounds[i], positionAccessor.min[i]);
                    maxBounds[i] = Math.max(maxBounds[i], positionAccessor.max[i]);
                  }
                }
              }
            }
          });
          
          if (minBounds && maxBounds) {
            const width = maxBounds[0] - minBounds[0];
            const height = maxBounds[1] - minBounds[1]; 
            const depth = maxBounds[2] - minBounds[2];
            
            console.log(`   Width:  ${width.toFixed(4)} units`);
            console.log(`   Height: ${height.toFixed(4)} units`);
            console.log(`   Depth:  ${depth.toFixed(4)} units`);
            console.log(`   Min bounds: [${minBounds.map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`   Max bounds: [${maxBounds.map(v => v.toFixed(4)).join(', ')}]`);
            
            results[size] = {
              width: parseFloat(width.toFixed(4)),
              height: parseFloat(height.toFixed(4)),
              depth: parseFloat(depth.toFixed(4)),
              minBounds,
              maxBounds
            };
          } else {
            console.log('   ⚠️  No bounding box data found');
          }
        } else {
          console.log('   ⚠️  No position accessors found');
        }
      } else {
        console.log('   ⚠️  No meshes found');
      }
      
      // Also check nodes for any scale or size hints
      if (gltfData.nodes && gltfData.nodes.length > 0) {
        const node = gltfData.nodes[0];
        if (node.name) {
          console.log(`   Node name: ${node.name}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error reading ${filename}:`, error.message);
    }
  });

  console.log('\n📊 Summary for TypeScript bookSizeMap:');
  console.log('```typescript');
  console.log('const bookSizeMap: Record<string, [width: number, height: number, depth: number]> = {');
  
  // Map GLTF sizes to legacy sizes
  const sizeMapping = {
    'XS': 'thin',
    'SM': 'medium', 
    'MD': 'thick',
    'LG': 'veryThick',
    'XL': 'extraThick'
  };
  
  Object.entries(sizeMapping).forEach(([gltfSize, legacySize]) => {
    if (results[gltfSize]) {
      const { width, height, depth } = results[gltfSize];
      console.log(`  ${legacySize}: [${width}, ${height}, ${depth}],`);
    }
  });
  
  console.log('};');
  console.log('```');

  console.log('\n🎯 Contentful Size Mapping:');
  console.log('```typescript');
  console.log('const contentfulSizeMap: Record<string, [width: number, height: number, depth: number]> = {');
  Object.entries(results).forEach(([size, dims]) => {
    console.log(`  "${size}": [${dims.width}, ${dims.height}, ${dims.depth}],`);
  });
  console.log('};');
  console.log('```');

  return results;
}

// Run the analysis
analyzeGLTFDimensions();