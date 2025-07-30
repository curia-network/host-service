Great, I’ll dive into how to use the `envio.lukso-mainnet.universal.tech` GraphQL indexer to retrieve the list of Universal Profiles a user is following, along with name and avatar metadata, using a reliable and scalable approach suitable for integration into your Node.js/TypeScript backend. I’ll also include guidance and code patterns your Cursor AI agent can follow.

I’ll update you shortly with the findings and recommended integration steps.


# LUKSO Universal Profile Friends Synchronization (LSP26 Social Connections)

## Introduction

To sync a Universal Profile’s “friends” (followed profiles) on LUKSO, we need to fetch the list of addresses that a given Universal Profile is following, and then resolve each address to profile information (name, avatar, etc.). LUKSO’s **LSP26 Follower System** defines a standard way to record social connections on-chain, and the **LUKSO team provides a GraphQL indexing service** to query this data efficiently. Below, we outline the official methods to retrieve a profile’s following list and recommend a practical approach for integration.

## Understanding LSP26 – The Follower Registry

LUKSO’s **LSP26-FollowerSystem** is a smart contract registry that stores two lists for each address: (1) the addresses that an address *follows*, and (2) the addresses that *follow* an address. On LUKSO mainnet, the official LSP26 follower registry is deployed at **0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA**. This contract emits events for follow/unfollow actions and maintains the current state of followers/follows.

Key functions provided by LSP26 include:

* **`followingCount(address)`** – returns how many addresses a given address is following.
* **`followerCount(address)`** – returns how many followers a given address has.
* **`getFollowsByIndex(address, startIndex, endIndex)`** – returns the list of addresses that the given address is following within the index range.
* **`getFollowersByIndex(address, startIndex, endIndex)`** – returns the list of addresses following the given address within the range.

These *enumeration* functions are designed for on-chain pagination. For example, if a user follows N addresses, you can call `getFollowsByIndex(user, 0, N-1)` to fetch the whole list (or break it into chunks for very large N). The LSP26 spec notes that while you **can** query these lists directly on-chain, **indexing services can greatly simplify access when dealing with a large number of connections**. In other words, direct RPC calls are possible but may become inefficient for hundreds or thousands of entries, so an off-chain indexer is recommended for scalability.

## Official Retrieval Methods for Following Lists

### 1. **GraphQL Indexer (Envio HyperIndex – *Recommended*)**

The **most practical and officially recommended method** is to use LUKSO’s GraphQL indexing service powered by Envio HyperIndex. The LUKSO team has partnered with Envio to provide a high-performance GraphQL API for on-chain data. This hosted indexer has a GraphQL endpoint for LUKSO mainnet:

```text
https://envio.lukso-mainnet.universal.tech/v1/graphql
```

This GraphQL service indexes LUKSO smart contracts and allows flexible queries for real-time and historical data. In fact, LUKSO’s official Universal Profile dApp uses this **GraphQL “Graph mode”** by default (with an RPC fallback) specifically because it’s faster and enables richer queries. The dApp’s config points the GraphQL client to the above endpoint.

Using the GraphQL API, you can query the **social graph** (followers/follows) in a single request. For example, you can retrieve all addresses that a given user follows by querying the indexed follow records where the **follower** matches your user’s address. The indexer likely maintains a table of follow relationships (or exposes the contract’s state via GraphQL), so a query might look conceptually like:

```graphql
query GetFollowing($user: String!) {
  follows(where: { follower: { _eq: $user } }) {
    address   # the address being followed
  }
}
```

*(The exact schema may differ, but the idea is to filter follow entries by follower address.)* The result would be a list of addresses that `$user` is following, with support for pagination if needed (for example, GraphQL might return `follows(limit: 100, offset: 100)` for paging). This single GraphQL query replaces having to make multiple RPC calls, and it’s very fast – Envio’s HyperIndex is optimized for “blazing-fast” data retrieval on LUKSO.

**Why this is recommended:** It offloads heavy data crunching to the indexer. Rather than your backend iterating through contract calls or events, the indexer returns the follow list directly from its database. This is **scalable to thousands of connections** and usually responds within milliseconds. It’s also **up-to-date** with on-chain data in near real-time. By using the official indexer, you follow LUKSO best practices and benefit from any future optimizations or schema improvements. (Notably, no official REST API like EFP exists for LUKSO yet; GraphQL is the provided solution.)

**Integration Tip:** You can use a Node.js GraphQL client (like Apollo or `graphql-request`) to call the endpoint. No authentication was indicated for read queries (the UP dApp calls it from the frontend). Simply construct the query to fetch the `following` list for the user’s address. The indexer may also allow retrieving related data (for example, you might be able to query profile names or URIs in the same query if those are indexed, though that depends on the schema). Even if not, you can fetch the addresses first, then resolve profiles in a second step (described below).

*In summary, the Envio GraphQL service is the **easiest and most reliable** way to get a Universal Profile’s following list on LUKSO, as recommended by LUKSO’s developers.* ✅

### 2. **Direct Contract Calls via RPC (On-Chain Query)**

An alternative is to query the LSP26 follower registry contract directly through a web3/ethers provider (RPC). This does **not** require any external indexer and reads straight from the blockchain state. The steps are:

1. Use `followingCount(upAddress)` to get the total number of accounts the user is following. Let this be `count`.
2. If `count` is reasonably small, call `getFollowsByIndex(upAddress, 0, count - 1)` to retrieve the entire list in one call. The contract will return an array of addresses. If the list is large (say thousands), you might call in batches (e.g. 0-499, 500-999, etc.) to avoid hitting RPC response size or gas limits for a single call.
3. The returned addresses are the Universal Profile addresses that `upAddress` follows. You can then proceed to resolve their names/avatars.

This approach leverages the built-in pagination of LSP26 and gives you **accurate on-chain data** without any third-party. However, the downsides are performance and complexity: reading a very large array from a contract can be slow and memory-intensive for the RPC node. Multiple calls in series can also be slow (each call might take a few hundred milliseconds to complete, and doing 10+ calls adds latency). In testing, a single call returning a few hundred addresses should be fine, but thousands might push limits.

For a target of \~1000 follows, it’s borderline – it might work in one call, but to be safe you could fetch in chunks of, say, 200. This is still reasonably fast but not as instant as a single database query via GraphQL. Also, you’ll want to implement caching of results (which you planned, e.g. 1-hour cache) so that you don’t hit the RPC repeatedly for the same data.

**Summary:** Direct RPC querying is **possible and fully decentralized**, and is a good fallback if you prefer not to rely on an external service. But for large follow lists or frequent queries, it may be less performant. It also lacks the convenience of built-in profile metadata, so you’d still have to do the profile resolution step separately. Use this method if you need absolute independence from external indexers, or as a backup path if the indexer is down.

### 3. **Event Log Parsing (Custom Indexing)**

Under the hood, the follow registry emits events for each follow/unfollow action: `Follow(address follower, address addr)` and `Unfollow(address unfollower, address addr)`. Another approach is to **scan the blockchain logs** to determine the follow list. This essentially means building your own mini-indexer:

* Use an Ethereum log query (via Web3.js or Ethers) on the LSP26 contract for all `Follow` events where `follower = upAddress`. This will give you all addresses that user followed over time. Likewise, you could query `Unfollow` events for any removals.
* Process the events in chronological order to construct the current set of following addresses. (Alternatively, since the LSP26 contract ensures the state, you could fetch all Follow events and remove any addresses that have a corresponding Unfollow event by the same user later. The final set is who they still follow.)

Many RPC providers allow filtering events by indexed topics (both follower and addr are indexed in the event, so you can filter by follower address directly). However, pulling logs from genesis or large block ranges can be heavy. For LUKSO, which launched mainnet in 2023, the total data might still be manageable, but as usage grows this will not scale well on-demand. This is essentially what a service like The Graph or Envio would do once and store results.

**We generally don’t recommend** doing this at request-time for each user login – it’s better to either use the official indexer or run a persistent indexing process. If you wanted, you could set up your own background worker to listen for new Follow/Unfollow events and update a database of social connections. That’s a custom solution (and effectively reimplements what the GraphQL service provides). Given that LUKSO has an available indexer, a DIY approach is unnecessary unless you have very custom needs or want full control.

### 4. **Third-Party APIs or Subgraphs**

Currently, there isn’t an exact equivalent to the Ethereum Follow Protocol (EFP) API for LUKSO maintained as a simple REST service. LUKSO’s ecosystem relies on the standards and the indexer approach. As of 2025, **The Graph** (popular subgraph service) does **not yet support LUKSO** mainnet, so you can’t use a Graph subgraph on a hosted service. There are other multi-chain indexers like **SubQuery** or **Ponder**, but none are known to provide a ready-made social graph for LUKSO out of the box.

The **recommended path from LUKSO** is to use their official GraphQL endpoint (or run an Envio indexer yourself) rather than waiting for a third-party solution. The Universal Profile cloud and other LUKSO tools have been built around this GraphQL/Hasura indexing approach. If needed, you could self-host a similar GraphQL indexer: Envio’s tooling allows you to **import the LSP26 contract** and spin up a GraphQL API quickly, or even do multi-chain indexing. But for most cases, leveraging the hosted **envio.lukso-mainnet.universal.tech** endpoint is simplest.

*To summarize: there is no official REST API, but the GraphQL indexer **is** the official API for such data. It’s maintained as part of LUKSO’s infrastructure and optimized for this use case.*

## Profile Metadata Resolution (LSP3)

Once you have the list of followed addresses, the next step is to get each profile’s **name** and **avatar image** (so you can display “Alice (alice.lukso)’s avatar” instead of just a hex address). LUKSO’s Universal Profiles store their profile info according to the **LSP3-Profile-Metadata** standard. Each profile (which is an ERC725 smart contract) has a data key called `LSP3Profile` that points to a JSON metadata object. This JSON (usually on IPFS) contains fields like `name`, `description`, `links`, `tags`, and links to media (avatar, profile images, etc.). For example, the JSON might look like:

```json
{
  "LSP3Profile": {
    "name": "Alice",
    "description": "Profile of Alice...",
    "tags": ["creative", "lukso"],
    "links": [ { "title": "Twitter", "url": "..."} ],
    "avatar": [ ... ],        // (3D avatar files, optional)
    "profileImage": [        // profile picture(s) in various sizes
       { "width": 256, "height": 256, "url": "ipfs://Qm.../image.png", "verification": { ... } },
       { "width": 1024, "height": 1024, "url": "ipfs://Qm.../image@2x.png", ... }
    ]
  }
}
```

To retrieve this for each address:

* **Call the Universal Profile contract’s ERC725Y data** for the `LSP3Profile` key. In practice, you can use the ERC725 JS library (`erc725.js`) or Lukso’s `@lukso/lsp-factory`/SDK to fetch the profile. The contract will return a URL (usually an `ipfs://...` or `ipfs://<CID>` link) which points to the JSON file. (The key is stored as a **Verifiable URI** type.)
* **Fetch the JSON from IPFS.** You can use an IPFS gateway to retrieve the content. LUKSO runs an IPFS gateway at `https://api.universalprofile.cloud/ipfs/` which you can use (or any public IPFS gateway) – just replace the `ipfs://` scheme with the gateway URL. For example, if the contract returns `ipfs://QmABC123...`, fetch `https://api.universalprofile.cloud/ipfs/QmABC123...`. This will give you the JSON text.
* **Parse the JSON.** Extract the `"name"` field (e.g. `"Alice"`) and the `"profileImage"` field. The profileImage is an array of images; you can choose one (perhaps the first or the one with a suitable size) to use as the avatar URL. The `url` in that object may still be an `ipfs://` link, so convert it via an IPFS gateway URL similarly to get an HTTP link that your app can use to display the image. (Some profiles might only have the `avatar` field or both; typically `profileImage` is used for the display picture.)

This process gives you each friend’s display name and avatar image URL. You should **cache these metadata results** (they rarely change often) to avoid repeatedly fetching from IPFS. It’s acceptable to cache for hours or even a day, since profile updates are infrequent.

**Performance Consideration:** If you have 1000+ connections, doing 1000 IPFS fetches on every login is not feasible. Instead, consider populating a local database or cache with profile info. For example, maintain a table of `ProfileInfo(address, name, avatarURL, lastFetched)` and update entries periodically or on demand. The first time a profile is seen, fetch its data; subsequent times, use the cached data (unless an update is needed). This way, the cost of profile resolution is amortized.

Also note that the GraphQL indexer might have indexed some profile metadata as well (since Envio can join on-chain and off-chain data). It’s possible the indexer could return profile names or even resolve the IPFS internally. For instance, the Universal Profile dApp shows profile names while in GraphQL mode – this hints that either the front-end fetches those separately or the indexer provides them. If the GraphQL schema includes profile metadata, you could query names in the same request (e.g. a join between follow addresses and a profile table). This would be ideal, but since details are sparse, be prepared to do it manually as described.

## Integration Summary & Best Practice

**Recommended Approach:** Use the **LUKSO GraphQL indexer (Envio)** to fetch the following list, then retrieve profile names/avatars via the **LSP3 metadata** for each address. This approach meets all the requirements:

* **✅ Retrieve following lists**: The GraphQL query will return all followed addresses for a given Universal Profile in one call (with built-in pagination support for very large lists). This covers users with 1000+ follows easily.
* **✅ Scalable & Performant**: The indexer is built for speed – queries that would be heavy via RPC are answered from a pre-indexed database. This keeps response times low (sub-second even for large lists). By caching results on your end (e.g. storing the follow list and profile info for an hour), you further reduce load and ensure quick responses (<5s is easily achievable for typical users).
* **✅ Profile metadata**: With the addresses in hand, you can obtain each profile’s name and avatar. This satisfies the requirement to display human-readable info. Using LSP3 metadata ensures you get the **Universal Profile name** (which users often set to a friendly handle) and their chosen avatar image. Your implementation can gracefully fall back to showing the address (or an identicon) if a profile has no name or image.
* **✅ Mainnet reliability**: All of the above works on LUKSO mainnet (Chain ID 42). The GraphQL endpoint given is for mainnet; ensure you **use the mainnet endpoint** (not testnet) as you noted. The LSP26 contract address is the mainnet registry. Using official standards/contracts means your solution will continue to work as LUKSO evolves those (e.g. if LSP26 upgrades to support new features like private follows, the indexer will likely accommodate that).
* **✅ Maintainable & Best Practice**: This solution aligns with LUKSO’s architecture. It leverages **standard contracts and official services** rather than any hacky or unverified method. Should there be any changes or improvements (for example, if LUKSO launches an official unified social API or updates Envio’s schema), your implementation can adapt easily since it’s built on the same foundation. Additionally, by using GraphQL and standard libraries, your code remains clean and understandable.

Finally, remember to handle cases like network issues or rate limits: if the GraphQL query fails (or is slow), your service should handle the error gracefully (maybe retry or fall back to a smaller RPC query as a backup). Implement reasonable caching so that you don’t overload the GraphQL API with repetitive calls. The LUKSO indexer is robust, but treating it kindly (caching frequent results, batching requests if needed) will ensure smooth operation.

With this approach, you’ll achieve a reliable **friends synchronization** for Universal Profiles, analogous to your Ethereum EFP solution, and ready to enrich your decentralized forum with social features on LUKSO. 🚀

## References and Sources

* LUKSO LSP-26 Follower System – standard definition and contract methods
* Envio HyperIndex announcement – GraphQL indexing support for LUKSO
* Universal Profile dApp source – uses GraphQL indexer by default for faster data fetching
* LUKSO LSP-3 Profile Metadata – profile JSON schema (name, avatar, etc.)
* LUKSO docs and community resources on Universal Profiles and social connections (no official REST API; GraphQL is the primary interface).
