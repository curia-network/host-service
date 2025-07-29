import { EfpFriendsService } from './EfpFriendsService';

/**
 * Example usage of EfpFriendsService
 * This demonstrates how the service integrates with existing patterns
 */

// Example: Fetch friends for an ENS user
async function exampleUsage() {
  const efpService = new EfpFriendsService();
  
  // Example ENS user address
  const ensUserAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
  const userId = 'user123';

  try {
    console.log('🔍 Fetching EFP friends...');
    
    // Use caching method (recommended for production)
    const friends = await efpService.fetchWithCache(ensUserAddress, userId);
    
    console.log(`✅ Found ${friends.length} friends:`);
    friends.slice(0, 5).forEach(friend => {
      console.log(`  - ${friend.name} (${friend.id}) ${friend.imageUrl ? '🖼️' : ''}}`);
    });

    // Cache stats for debugging
    const stats = efpService.getCacheStats();
    console.log(`📊 Cache stats: ${stats.size} entries`);
    
  } catch (error) {
    console.error('❌ Error fetching friends:', error);
  }
}

// Example integration with DataProvider pattern
export function createEfpFriendsServiceForDataProvider(): EfpFriendsService {
  return new EfpFriendsService();
}

// Export for testing
export { exampleUsage };