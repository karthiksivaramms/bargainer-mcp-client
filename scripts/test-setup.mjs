import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🛍️  Bargainer MCP Server - Quick Test\n');

// Test the built server
try {
  console.log('✅ Testing server imports...');
  
  // Check if build output exists
  const distPath = join(__dirname, '..', 'dist');
  const indexPath = join(distPath, 'index.js');
  
  if (existsSync(indexPath)) {
    console.log('✅ Build output found at:', indexPath);
  } else {
    console.log('❌ Build output not found. Run: npm run build');
    process.exit(1);
  }
  
  // Test environment variables
  console.log('\n🔧 Environment Configuration:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('- Slickdeals API Key:', process.env.SLICKDEALS_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('- RapidAPI Key:', process.env.RAPIDAPI_KEY ? '✅ Set' : '❌ Not set');
  
  // Test package.json
  console.log('\n📦 Package Information:');
  const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
  console.log('- Name:', packageJson.name);
  console.log('- Version:', packageJson.version);
  console.log('- Main:', packageJson.main);
  
  // List available scripts
  console.log('\n🔧 Available Scripts:');
  Object.keys(packageJson.scripts).forEach(script => {
    console.log(`- npm run ${script}`);
  });
  
  // Test basic imports (if possible)
  console.log('\n📚 Testing Module Structure:');
  const modulesToCheck = [
    'dist/types.js',
    'dist/providers/index.js',
    'dist/services/aggregator.js',
    'dist/server.js'
  ];
  
  modulesToCheck.forEach(modulePath => {
    const fullPath = join(__dirname, '..', modulePath);
    if (existsSync(fullPath)) {
      console.log(`✅ ${modulePath}`);
    } else {
      console.log(`❌ ${modulePath} - missing`);
    }
  });
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Set up API keys in .env file');
  console.log('2. Run: npm run dev (for development)');
  console.log('3. Or run: npm start (for production)');
  console.log('4. Configure Claude Desktop (see docs/claude-desktop-config.md)');
  
  console.log('\n🔍 Example Usage:');
  console.log('Once running, you can use these MCP tools:');
  console.log('- search_deals: Find deals by query');
  console.log('- get_top_deals: Get trending deals');
  console.log('- filter_deals: Filter existing deals');
  console.log('- get_deal_details: Get detailed deal info');
  console.log('- compare_deals: Compare similar deals');
  console.log('- get_available_sources: List deal sources');
  
  console.log('\n✨ Setup test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Check that all files were created properly');
  process.exit(1);
}
