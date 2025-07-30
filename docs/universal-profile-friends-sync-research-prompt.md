# Universal Profile Friends Sync Research Request

## 🎯 **Objective**
We need to implement a friends synchronization service for Universal Profiles on the LUKSO blockchain that can retrieve a user's social connections (following list) to display in our forum application.

## 🏗️ **Current Working Implementation (EFP)**
We have successfully implemented friends sync for Ethereum users using the **Ethereum Follow Protocol (EFP)**:

- **API Endpoint**: `https://api.ethfollow.xyz/api/v1/users/{ethAddress}/following`
- **Functionality**: Returns paginated list of addresses that a user follows
- **Data Structure**: Array of following records with wallet addresses
- **ENS Resolution**: We resolve addresses to `.eth` names using `https://api.ensdata.net/{address}`
- **Status**: ✅ **Working perfectly**

## 🎯 **What We Need for Universal Profiles**
We need the **equivalent functionality** for LUKSO Universal Profiles:

### **Core Requirements:**
1. **Input**: Universal Profile address (0x... on LUKSO mainnet)
2. **Output**: List of Universal Profile addresses that this user follows
3. **Pagination**: Support for large following lists (1000+ connections)
4. **Profile Resolution**: Ability to get UP name and avatar from addresses

### **Technical Context:**
- **Blockchain**: LUKSO mainnet (`https://rpc.mainnet.lukso.network`, Chain ID: 42)
- **Standard**: LSP26 Following Registry (social connections standard for Universal Profiles)
- **Profile Metadata**: LSP3 Universal Profile metadata (similar to ENS profiles)

## 🔍 **What We've Already Investigated**

### **✅ LSP26 Following Registry Contract**
- **Contract Address**: `0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA`
- **Available Methods**:
  - `followerCount(address)` → Returns number of followers
  - `isFollowing(follower, target)` → Returns boolean if A follows B
- **❌ Problem**: Only provides **verification**, not **enumeration** (can't get list of who someone follows)

### **❌ ERC725Y Direct Queries**
- **Attempted**: Direct blockchain queries using `@lukso/lsp-smart-contracts`
- **Problem**: LSP26 data keys not available in current package version
- **Available Keys**: LSP1, LSP3, LSP4, LSP5, LSP6, LSP8, LSP9, LSP10, LSP12, LSP17
- **Missing**: LSP26 data keys for social connections

### **🤔 Universal Profile Metadata (LSP3)**
- **Available**: UP name, avatar, description via LSP3 metadata
- **Access**: Through `getData()` calls on UP contracts + IPFS resolution
- **Status**: We can resolve profile info, but not social connections

## 🔎 **Research Questions**

### **Primary Question:**
**What is the recommended/official way to retrieve a Universal Profile's following list (social connections) on LUKSO mainnet?**

### **Specific Areas to Research:**

1. **Graph/Indexer Services:**
   - Does LUKSO have an official GraphQL indexer for social data?
   - Are there third-party indexers like The Graph for LUKSO social connections?
   - Any LUKSO-specific APIs similar to EFP's REST API?

2. **Enhanced LSP26 Access:**
   - Are there LSP26 registry contracts with enumeration methods?
   - Different contract addresses with `getFollowing(address)` methods?
   - Official LUKSO tooling for social graph queries?

3. **Universal Profile Ecosystem:**
   - Official LUKSO APIs or SDKs for social features?
   - Community-built services for UP social data?
   - Integration with existing UP wallets/browsers?

4. **Alternative Approaches:**
   - Event log parsing from LSP26 contracts (Follow/Unfollow events)?
   - IPFS-based social graph storage patterns?
   - Hybrid approaches combining multiple data sources?

5. **Performance Considerations:**
   - Rate limiting and caching strategies for LUKSO RPC
   - Recommended patterns for social data at scale
   - Cost implications of different approaches

## 💻 **Technical Integration Requirements**

### **Our Stack:**
- **Backend**: Node.js/TypeScript
- **Blockchain**: Web3.js + ethers.js
- **Caching**: In-memory (planning Redis for future)
- **Database**: PostgreSQL with user identity tracking

### **Expected Interface:**
```typescript
interface FriendInfo {
  id: string;        // UP address
  name: string;      // UP name or formatted address
  image?: string;    // UP avatar URL
}

// Desired API:
async fetchUserFollowing(upAddress: string): Promise<FriendInfo[]>
```

### **Performance Expectations:**
- Handle 1000+ connections per user
- Response time < 5 seconds for typical users
- Graceful degradation for network issues
- Appropriate caching (1-hour cache acceptable)

## 🎯 **Success Criteria**
The ideal solution should:

1. **✅ Retrieve following lists** for any Universal Profile address
2. **✅ Scale to hundreds of connections** per user  
3. **✅ Provide profile metadata** (name, avatar) for each connection
4. **✅ Work reliably** with LUKSO mainnet
5. **✅ Have reasonable performance** (similar to our EFP implementation)
6. **✅ Be maintainable** and follow LUKSO best practices

## 📚 **Context: Our Use Case**
- **Application**: Decentralized forum with embedded social features
- **Users**: Universal Profile holders who want to see their friends' activity
- **Scale**: Hundreds of users, thousands of social connections
- **Update Frequency**: Sync friends on login (not real-time required)

## 🙏 **Request**
Please research and recommend the **most practical, reliable, and scalable approach** for implementing Universal Profile friends synchronization based on current LUKSO ecosystem capabilities and best practices.

**Priority**: Technical feasibility and reliability over experimental/cutting-edge solutions.