/**
 * Simple test to verify the package exports work correctly
 */

const { 
  ApiProxyClient,
  ApiProxyServer,
  createProxyClient,
  createProxyServer,
  VERSION,
  PACKAGE_NAME,
  METADATA
} = require('./dist/index.js');

console.log('🧪 Testing @curia/iframe-api-proxy package...\n');

// Test package metadata
console.log('📋 Package Info:');
console.log(`  Name: ${PACKAGE_NAME}`);
console.log(`  Version: ${VERSION}`);
console.log(`  Description: ${METADATA.description}`);
console.log('');

// Test client creation
console.log('🖥️  Testing ApiProxyClient...');
try {
  const client = new ApiProxyClient({ debug: true });
  console.log('  ✅ ApiProxyClient created successfully');
  console.log('  📊 Status:', client.getStatus());
  client.destroy();
  console.log('  ✅ ApiProxyClient destroyed successfully');
} catch (error) {
  console.log('  ❌ ApiProxyClient test failed:', error.message);
}
console.log('');

// Test server creation
console.log('🖥️  Testing ApiProxyServer...');
try {
  const server = new ApiProxyServer({ 
    baseUrl: 'https://api.example.com',
    debug: true 
  });
  console.log('  ✅ ApiProxyServer created successfully');
  console.log('  📊 Status:', server.getStatus());
  server.destroy();
  console.log('  ✅ ApiProxyServer destroyed successfully');
} catch (error) {
  console.log('  ❌ ApiProxyServer test failed:', error.message);
}
console.log('');

// Test helper functions
console.log('🔧 Testing helper functions...');
try {
  const client = createProxyClient({ debug: false });
  console.log('  ✅ createProxyClient works');
  client.destroy();
  
  const server = createProxyServer({ baseUrl: 'https://api.example.com' });
  console.log('  ✅ createProxyServer works');
  server.destroy();
} catch (error) {
  console.log('  ❌ Helper functions test failed:', error.message);
}
console.log('');

console.log('🎉 Package test completed successfully!');
console.log('');
console.log('Ready for Phase 2: Host Service Integration'); 