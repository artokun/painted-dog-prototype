const fs = require('fs');
const path = require('path');

// Simple GLTF parser to extract bounding box info
function analyzeGLTF(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const gltf = JSON.parse(data);
    
    console.log(`\n📏 Analyzing: ${path.basename(filePath)}`);
    
    // Look for accessor data that might contain position information
    if (gltf.accessors) {
      gltf.accessors.forEach((accessor, index) => {
        if (accessor.type === 'VEC3' && accessor.min && accessor.max) {
          const width = accessor.max[0] - accessor.min[0];
          const height = accessor.max[1] - accessor.min[1];  
          const depth = accessor.max[2] - accessor.min[2];
          
          console.log(`  Accessor ${index}:`);
          console.log(`    Min: [${accessor.min.join(', ')}]`);
          console.log(`    Max: [${accessor.max.join(', ')}]`);
          console.log(`    Dimensions: w=${width.toFixed(4)}, h=${height.toFixed(4)}, d=${depth.toFixed(4)}`);
        }
      });
    }
    
    // Look for nodes with mesh bounding info
    if (gltf.meshes) {
      gltf.meshes.forEach((mesh, meshIndex) => {
        console.log(`  Mesh ${meshIndex}: ${mesh.name || 'Unnamed'}`);
        if (mesh.primitives) {
          mesh.primitives.forEach((primitive, primIndex) => {
            console.log(`    Primitive ${primIndex}: attributes =`, Object.keys(primitive.attributes || {}));
          });
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
  }
}

// Analyze all book models
const modelsDir = path.join(__dirname, '../public/models');
const sizes = ['XS', 'SM', 'MD', 'LG', 'XL'];

console.log('🔍 Analyzing GLTF Book Model Dimensions');
console.log('=====================================');

sizes.forEach(size => {
  const filePath = path.join(modelsDir, `Book_${size}.gltf`);
  if (fs.existsSync(filePath)) {
    analyzeGLTF(filePath);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n✅ Analysis complete');
console.log('=====================================');