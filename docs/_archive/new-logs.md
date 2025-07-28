[CgLibContext] CgPluginLib initialized successfully.
VM11312 AppInitializer.tsx:33 [AppInitializer] CgInstance and iframeUid available. Attempting to fetch user data and login.
VM10223 AuthContext.tsx:265 [AuthContext] AuthService initialized.
ApiProxyClient.ts:259 [ApiProxyClient] API response received: {requestId: 'req_1753443029508_t9fiie7bz', responseTime: '39ms', success: true}
AuthenticationService.ts:184 [AuthenticationService] ✅ API proxy SUCCESS for getUserProfile on Phase1 attempt 1 (66ms total)
AuthenticationService.ts:353 [AuthenticationService] API proxy profile success
ApiProxyClient.ts:259 [ApiProxyClient] API response received: {requestId: 'req_1753443029508_x0o0svjr2', responseTime: '40ms', success: true}
AuthenticationService.ts:184 [AuthenticationService] ✅ API proxy SUCCESS for getUserCommunities on Phase1 attempt 1 (66ms total)
AuthenticationService.ts:303 [AuthenticationService] API proxy success: 12 communities
InternalPluginHost.ts:496 [InternalPluginHost] User has 12 communities, showing navigation
InternalPluginHost.ts:497 [MULTI-IFRAME] Community navigation initialized - switching enabled for 12 communities
InternalPluginHost.ts:527 [InternalPluginHost] Starting 5-second community polling (initial)
InternalPluginHost.ts:245 [InternalPluginHost] Step 3: Setting up final layout with sidebar
InternalPluginHost.ts:685 [InternalPluginHost] Switching to forum phase via services
InternalPluginHost.ts:634 [InternalPluginHost] Setting up container layout with dimensions: {width: '100%', height: '100%', configHeight: '100%'}
CommunityItem.ts:129 [MULTI-IFRAME] [OnlineIndicator] Adding online dot for community: E.V.I.L. Clan
UserProfile.ts:80 [UserProfile] 🔧 Updated session cache (menu closed), count: 3
VM9928 intercept-console-error.js:51 [CgPluginLib] Failed to sign request: TypeError: Failed to fetch
    at CgPluginLib.eval (VM10229 CgPluginLib.js:278:40)
eval @ VM10229 CgPluginLib.js:296
rejected @ VM10229 CgPluginLib.js:18
setupContainerLayout @ InternalPluginHost.ts:672
switchToForum @ InternalPluginHost.ts:694
onAuthComplete @ InternalPluginHost.ts:246
Promise.then
step @ VM10229 CgPluginLib.js:19
eval @ VM10229 CgPluginLib.js:20
__awaiter @ VM10229 CgPluginLib.js:16
signRequest @ VM10229 CgPluginLib.js:272
eval @ VM10229 CgPluginLib.js:219
eval @ VM10229 CgPluginLib.js:20
__awaiter @ VM10229 CgPluginLib.js:16
makeApiRequest @ VM10229 CgPluginLib.js:212
eval @ VM10229 CgPluginLib.js:109
eval @ VM10229 CgPluginLib.js:20
__awaiter @ VM10229 CgPluginLib.js:16
getUserInfo @ VM10229 CgPluginLib.js:108
AppInitializer.useEffect.fetchDataAndLogin @ VM11312 AppInitializer.tsx:37
AppInitializer.useEffect @ VM11312 AppInitializer.tsx:92

VM9928 intercept-console-error.js:51 [AppInitializer] Error during CgLib data fetching or application login process: Error: Failed to sign request: Failed to fetch
    at CgPluginLib.eval (VM10229 CgPluginLib.js:297:23)
    at Generator.throw (<anonymous>)
    at rejected (VM10229 CgPluginLib.js:18:65)
error @ VM9928 intercept-console-error.js:51
AppInitializer.useEffect.fetchDataAndLogin @ VM11312 AppInitializer.tsx:87
setupContainerLayout @ InternalPluginHost.ts:672
switchToForum @ InternalPluginHost.ts:694
onAuthComplete @ InternalPluginHost.ts:246
await in onAuthComplete
AppInitializer.useEffect @ VM11312 AppInitializer.tsx:92

CommunitySidebar.ts:419 [CommunitySidebar] Updating embed container reference for mobile boundaries
InternalPluginHost.ts:705 [InternalPluginHost] Reusing existing forum iframe from API proxy preparation
InternalPluginHost.ts:739 [ApiProxyClient] Active iframe set: http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIQOZP0D5
InternalPluginHost.ts:740 [InternalPluginHost] API proxy confirmed for final forum iframe
InternalPluginHost.ts:742 [InternalPluginHost] Forum phase setup complete
VM12777 upProfile.ts:536 [UPProfileFetcher] Initialized with 1 RPC endpoints.
VM12844 categoryRegistry.ts:27 [GatingRegistry] Registering category renderer: ethereum_profile
VM13128 cookieDebug.ts:94 🍪 Cookie debug utilities loaded! Use window.cookieDebug in console:
VM13128 cookieDebug.ts:95   window.cookieDebug.listAllCookies()
VM13128 cookieDebug.ts:96   window.cookieDebug.testSetCookie()
VM13128 cookieDebug.ts:97   window.cookieDebug.testGetSharedData()
VM13128 cookieDebug.ts:98   window.cookieDebug.manuallySetSharedCookie("123", "456")
InternalPluginHost.ts:537 [InternalPluginHost] Community refresh poll 1/5 (initial)
AuthenticationService.ts:287 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:297 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:123 [AuthenticationService] 🔄 Starting multi-phase API proxy calls for getUserCommunities (19 attempts over 3s)
AuthenticationService.ts:142 [AuthenticationService] 🎯 Phase1 attempt 1/19 for getUserCommunities (0ms elapsed)
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM13143 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM12475 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'dark'}
VM12475 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM12475 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM13144 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM13144 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM12054 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM12057 CgLibContext.tsx:85 [CgLibContext] Setting iframeUid from params: MDIQOZP0D5
VM12057 CgLibContext.tsx:97 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
VM12057 CgLibContext.tsx:105 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
AuthenticationService.ts:168 [AuthenticationService] ✅ Request signed for getUserCommunities
AuthenticationService.ts:174 [ApiProxyClient] API request sent: {requestId: 'req_1753443030842_8nndf6c2g', method: 'getUserCommunities', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
MessageRouter.ts:111 [MessageRouter] API proxy ready notification received
InternalPluginHost.ts:386 [InternalPluginHost] API proxy ready notification received
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM13516 theme-provider.tsx:63 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'dark', cgTheme: 'dark', backgroundForcedTheme: null}
VM13516 theme-provider.tsx:79 [CgThemeSynchronizer] Setting up background theme event listener
VM13516 theme-provider.tsx:94 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'dark', urlTheme: 'dark', backgroundForcedTheme: null, effectiveTheme: 'dark', shouldChange: false}
VM13516 theme-provider.tsx:106 [CgThemeSynchronizer] Theme already correct, no change needed
VM13516 theme-provider.tsx:112 [CgThemeSynchronizer] Setting global effective theme: dark
VM13143 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM12475 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'dark'}
VM12475 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM12475 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM13516 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM13144 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM13144 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM12054 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM12057 CgLibContext.tsx:85 [CgLibContext] Setting iframeUid from params: MDIQOZP0D5
VM12057 CgLibContext.tsx:97 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
VM12057 CgLibContext.tsx:105 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
VM13516 theme-provider.tsx:83 [CgThemeSynchronizer] Removing background theme event listener
VM13516 theme-provider.tsx:63 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'dark', cgTheme: 'dark', backgroundForcedTheme: null}
VM13516 theme-provider.tsx:79 [CgThemeSynchronizer] Setting up background theme event listener
VM13516 theme-provider.tsx:94 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'dark', urlTheme: 'dark', backgroundForcedTheme: null, effectiveTheme: 'dark', shouldChange: false}
VM13516 theme-provider.tsx:106 [CgThemeSynchronizer] Theme already correct, no change needed
VM13516 theme-provider.tsx:112 [CgThemeSynchronizer] Setting global effective theme: dark
VM13143 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM12475 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'dark'}
VM12475 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM12475 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM13516 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM13144 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM13144 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM12054 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM12057 CgLibContext.tsx:85 [CgLibContext] Setting iframeUid from params: MDIQOZP0D5
VM12057 CgLibContext.tsx:97 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
VM12057 CgLibContext.tsx:105 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12800 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM12800 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM12475 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
VM13143 AppInitializer.tsx:95 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
VM12475 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'dark'}
VM12475 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM12475 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM13516 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM13144 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM13144 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM12054 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM12057 CgLibContext.tsx:97 [CgLibContext] Initialize effect triggered. Current iframeUid: MDIQOZP0D5, publicKey set: true
VM12057 CgLibContext.tsx:110 [CgLibContext] Attempting to initialize CgPluginLib with iframeUid: MDIQOZP0D5
VM12060 CgPluginLib.js:71 [CgPluginLib] Initialized with iframeUid: MDIQOZP0D5
VM13143 AppInitializer.tsx:95 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
VM12475 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'dark'}
VM12475 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM12475 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM13516 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM13144 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM13144 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ApiProxyClient.ts:259 [ApiProxyClient] API response received: {requestId: 'req_1753443030842_8nndf6c2g', responseTime: '31ms', success: true}
AuthenticationService.ts:184 [AuthenticationService] ✅ API proxy SUCCESS for getUserCommunities on Phase1 attempt 1 (313ms total)
AuthenticationService.ts:303 [AuthenticationService] API proxy success: 12 communities
CommunityItem.ts:129 [MULTI-IFRAME] [OnlineIndicator] Adding online dot for community: E.V.I.L. Clan
InternalPluginHost.ts:586 [InternalPluginHost] Sidebar updated with 12 communities (changes detected)
VM12060 CgPluginLib.js:289 [CgPluginLib] Request signed successfully
VM12060 CgPluginLib.js:246 [CgPluginLib] Sent getContextData request: {type: 'api_request', iframeUid: 'MDIQOZP0D5', requestId: 'req_1753443030864_us1oxj5pd', method: 'getContextData', params: undefined, …}
MessageRouter.ts:140 [MessageRouter] API request: getContextData undefined
MessageRouter.ts:178 [MessageRouter] Making API request via proxy: getContextData
MessageRouter.ts:179 [MessageRouter] Auth context: {communityId: '1e5fb703-1805-42e7-927e-be3f7855856c', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'}
MessageRouter.ts:183 [MessageRouter] Signature present: true
MessageRouter.ts:184 [MULTI-IFRAME] [MessageRouter] API request "getContextData" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:186 [ApiProxyClient] API request sent: {requestId: 'req_1753443030882_xy8imnat2', method: 'getContextData', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
VM13151 ApiProxyServer.js:132 
            
            
           POST http://localhost:3001/api/user 400 (Bad Request)
makeApiRequest @ VM13151 ApiProxyServer.js:132
handleProxyRequest @ VM13151 ApiProxyServer.js:78
messageListener @ VM13151 ApiProxyServer.js:60
postMessage
sendRequestToIframe @ ApiProxyClient.ts:198
(anonymous) @ ApiProxyClient.ts:166
makeApiRequest @ ApiProxyClient.ts:148
handleApiRequest @ MessageRouter.ts:186
handleMessage @ MessageRouter.ts:121
messageListener @ MessageRouter.ts:70
postMessage
eval @ VM12060 CgPluginLib.js:245
eval @ VM12060 CgPluginLib.js:236
fulfilled @ VM12060 CgPluginLib.js:17
Promise.then
step @ VM12060 CgPluginLib.js:19
eval @ VM12060 CgPluginLib.js:20
__awaiter @ VM12060 CgPluginLib.js:16
makeApiRequest @ VM12060 CgPluginLib.js:212
eval @ VM12060 CgPluginLib.js:74
eval @ VM12060 CgPluginLib.js:20
__awaiter @ VM12060 CgPluginLib.js:16
initialize @ VM12060 CgPluginLib.js:58
CgLibProvider.useEffect @ VM12057 CgLibContext.tsx:113

ApiProxyClient.ts:259 [ApiProxyClient] API response received: {requestId: 'req_1753443030882_xy8imnat2', responseTime: '14ms', success: false}
MessageRouter.ts:194 [MessageRouter] API proxy response: {success: false, error: 'HTTP 400: Bad Request'}
MessageRouter.ts:205 [MessageRouter] API error: HTTP 400: Bad Request
error @ intercept-console-error.js:51
handleApiRequest @ MessageRouter.ts:205
await in handleApiRequest
handleMessage @ MessageRouter.ts:121
messageListener @ MessageRouter.ts:70
postMessage
eval @ VM12060 CgPluginLib.js:245
eval @ VM12060 CgPluginLib.js:236
fulfilled @ VM12060 CgPluginLib.js:17
Promise.then
step @ VM12060 CgPluginLib.js:19
eval @ VM12060 CgPluginLib.js:20
__awaiter @ VM12060 CgPluginLib.js:16
makeApiRequest @ VM12060 CgPluginLib.js:212
eval @ VM12060 CgPluginLib.js:74
eval @ VM12060 CgPluginLib.js:20
__awaiter @ VM12060 CgPluginLib.js:16
initialize @ VM12060 CgPluginLib.js:58
CgLibProvider.useEffect @ VM12057 CgLibContext.tsx:113

MessageRouter.ts:237 [MessageRouter] Error response sent for request: req_1753443030864_us1oxj5pd HTTP 400: Bad Request
VM12060 CgPluginLib.js:326 [CgPluginLib] Received response for req_1753443030864_us1oxj5pd: {type: 'api_response', iframeUid: 'MDIQOZP0D5', requestId: 'req_1753443030864_us1oxj5pd', error: 'HTTP 400: Bad Request'}
VM12060 CgPluginLib.js:79 [CgPluginLib] Failed to fetch context data during initialization: Error: HTTP 400: Bad Request
    at eval (VM12060 CgPluginLib.js:329:39)
eval @ VM12060 CgPluginLib.js:79
rejected @ VM12060 CgPluginLib.js:18
Promise.then
step @ VM12060 CgPluginLib.js:19
eval @ VM12060 CgPluginLib.js:20
__awaiter @ VM12060 CgPluginLib.js:16
initialize @ VM12060 CgPluginLib.js:58
CgLibProvider.useEffect @ VM12057 CgLibContext.tsx:113

VM12057 CgLibContext.tsx:116 [CgLibContext] CgPluginLib initialized successfully.
VM13143 AppInitializer.tsx:33 [AppInitializer] CgInstance and iframeUid available. Attempting to fetch user data and login.
VM12054 AuthContext.tsx:265 