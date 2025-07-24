AuthenticationService.ts:397 [AuthenticationService] Active session token updated (no auth context yet): 2034f22427424b5df69ec8fa9167427766c1efe1a0063da3234cf069e8718fc8
AuthenticationService.ts:85 [AuthenticationService] Initialized
AuthenticationService.ts:434 [AuthenticationService] Cross-tab session listener setup (using custom events)
AuthenticationService.ts:202 [AuthenticationService] Auth completion received: {type: 'curia-auth-complete', mode: 'full', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c', sessionToken: '2034f22427424b5df69ec8fa9167427766c1efe1a0063da3234cf069e8718fc8', …}
AuthenticationService.ts:213 [AuthenticationService] Auth context set: {userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c', sessionToken: '2034f22427424b5df69ec8fa9167427766c1efe1a0063da3234cf069e8718fc8', externalParams: {…}, parentUrl: undefined}
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363646153_etydlrltr', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:281 [AuthenticationService] Using API proxy with retry logic for profile
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserProfile (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserProfile
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363646153_0lu7l4z37', method: 'getUserProfile', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM4581 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserProfile, retrying in 250ms: API request failed for getUserProfile
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserProfile
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363657445_hiyzb6lpm', method: 'getUserProfile', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363657448_q3jahed2v', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserProfile, retrying in 500ms: API request failed for getUserProfile
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserProfile
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363657964_htx9gr37i', method: 'getUserProfile', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363657966_3wj6skb29', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserProfile after 3 attempts: API request failed for getUserProfile
AuthenticationService.ts:300 [AuthenticationService] 🚫 API proxy failed after all retries for profile: Error: API request failed for getUserProfile
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserProfile (AuthenticationService.ts:282:33)
    at async Promise.all (:3001/index 1)
    at async _InternalPluginHost.initializeCommunityNavigation (InternalPluginHost.ts:406:36)
    at async _InternalPluginHost.onAuthComplete (InternalPluginHost.ts:203:5)
    at async AuthenticationService.handleAuthCompletion (AuthenticationService.ts:217:7)
    at async _InternalPluginHost.onMessageAuthComplete (InternalPluginHost.ts:217:5)
    at async MessageRouter.handleMessage (MessageRouter.ts:86:9)
AuthenticationService.ts:301 [AuthenticationService] 🚫 Giving up on profile fetch - returning null
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async Promise.all (:3001/index 0)
    at async _InternalPluginHost.initializeCommunityNavigation (InternalPluginHost.ts:406:36)
    at async _InternalPluginHost.onAuthComplete (InternalPluginHost.ts:203:5)
    at async AuthenticationService.handleAuthCompletion (AuthenticationService.ts:217:7)
    at async _InternalPluginHost.onMessageAuthComplete (InternalPluginHost.ts:217:5)
    at async MessageRouter.handleMessage (MessageRouter.ts:86:9)
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363659205_ok2zujv6n', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363659493_glvpkpijv', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363660325_venor5jar', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363660349_cc8q6dks5', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async _InternalPluginHost.refreshCommunitySidebar (InternalPluginHost.ts:486:32)
    at async InternalPluginHost.ts:455:9
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363660645_uxibiggql', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363660988_6udfoergo', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363661161_qnvkchohn', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async _InternalPluginHost.refreshCommunitySidebar (InternalPluginHost.ts:486:32)
    at async InternalPluginHost.ts:455:9
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363661258_jsqnfmtzw', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363661778_vn0x3yalg', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async _InternalPluginHost.refreshCommunitySidebar (InternalPluginHost.ts:486:32)
    at async InternalPluginHost.ts:455:9
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363661987_o3cfs20jb', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363662262_63s2xmvx3', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363662781_q3cd3ynz2', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async _InternalPluginHost.refreshCommunitySidebar (InternalPluginHost.ts:486:32)
    at async InternalPluginHost.ts:455:9
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
AuthenticationService.ts:227 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:237 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:108 [AuthenticationService] 🔄 Starting API proxy calls for getUserCommunities (max 3 attempts)
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 1/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363662987_qhredjap6', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 1 failed for getUserCommunities, retrying in 250ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 2/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363663265_ns2k2tp1e', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:138 [AuthenticationService] ⏳ API proxy attempt 2 failed for getUserCommunities, retrying in 500ms: API request failed for getUserCommunities
AuthenticationService.ts:113 [AuthenticationService] 🎯 API proxy attempt 3/3 for getUserCommunities
AuthenticationService.ts:115 [ApiProxyClient] API request sent: {requestId: 'req_1753363663782_p6h7jyy6o', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
AuthenticationService.ts:132 [AuthenticationService] ❌ API proxy FINAL FAILURE for getUserCommunities after 3 attempts: API request failed for getUserCommunities
AuthenticationService.ts:253 [AuthenticationService] 🚫 API proxy failed after all retries for communities: Error: API request failed for getUserCommunities
    at AuthenticationService.makeApiCallWithRetry (AuthenticationService.ts:126:17)
    at async AuthenticationService.fetchUserCommunities (AuthenticationService.ts:238:33)
    at async _InternalPluginHost.refreshCommunitySidebar (InternalPluginHost.ts:486:32)
    at async InternalPluginHost.ts:455:9
AuthenticationService.ts:254 [AuthenticationService] 🚫 Giving up on community fetch - returning empty list
