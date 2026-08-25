/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building for bundle analysis...');
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  
  const buildDir = path.join(process.cwd(), '.next/static/chunks');
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.js'));
    console.log(`\nTotal JS chunks: ${files.length}`);
    
    const sizes = files.map(f => {
      const stat = fs.statSync(path.join(buildDir, f));
      return { file: f, size: stat.size };
    }).sort((a, b) => b.size - a.size);
    
    console.log('\nTop 10 largest chunks:');
    sizes.slice(0, 10).forEach(({ file, size }) => {
      console.log(`  ${file}: ${(size / 1024).toFixed(2)} KB`);
    });
  }
} catch (error) {
  console.error('Bundle analysis failed:', error.message);
  process.exit(1);
}
