VM1415 CommunitySelectionStep.tsx:199 [Embed] Joining community: a162cec0-5711-4c45-b58f-547a55837181
VM1415 CommunitySelectionStep.tsx:206 [Embed] Found community object: {id: 'a162cec0-5711-4c45-b58f-547a55837181', name: 'flowwolf', description: 'Continue to flowwolf', memberCount: 17, isPublic: true, …}
VM839 page.tsx:405 [Embed] Community selected: a162cec0-5711-4c45-b58f-547a55837181
VM839 page.tsx:406 [Embed] Community object: {id: 'a162cec0-5711-4c45-b58f-547a55837181', name: 'flowwolf', description: 'Continue to flowwolf', memberCount: 17, isPublic: true, …}
VM839 page.tsx:407 [Embed] Mode: full
VM839 page.tsx:408 [Embed] DEBUG - profileData state: {type: 'ens', address: '0xc94Ec8627cBC6dACBc2DF80526Fe445f073Bdac6', name: 'florianglatz.eth', domain: 'florianglatz.eth', avatar: 'https://euc.li/florianglatz.eth', …}
VM839 page.tsx:409 [Embed] DEBUG - currentStep: community-selection
VM839 page.tsx:415 [Embed] DEBUG - Using profileData for auth complete
VM839 page.tsx:430 [Embed] DEBUG - Sending auth complete with userId: ens:florianglatz.eth
VM839 page.tsx:133 [Embed] DEBUG - sendAuthCompleteMessage called with: {userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181', sessionToken: 'a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780'}
VM839 page.tsx:138 [Embed] DEBUG - Message to send: {type: 'curia-auth-complete', mode: 'full', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181', sessionToken: 'a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780', …}
VM839 page.tsx:139 [Embed] DEBUG - window.parent: Window {0: Window, 1: Window, window: Window, self: Window, document: document, name: '', location: Location, …}
VM839 page.tsx:140 [Embed] DEBUG - window.parent !== window: true
VM839 page.tsx:143 [Embed] DEBUG - Sending PostMessage to parent...
VM839 page.tsx:145 [Embed] DEBUG - PostMessage sent successfully
VM839 page.tsx:448 [Embed] Normal mode - proceeding to auth-complete step
InternalPluginHost.ts:462 [InternalPluginHost] Auth completion received from message router
AuthenticationService.ts:236 [AuthenticationService] Auth completion received: {type: 'curia-auth-complete', mode: 'full', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181', sessionToken: 'a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780', …}
AuthenticationService.ts:247 [AuthenticationService] Auth context set: {userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181', sessionToken: 'a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780', externalParams: {…}, parentUrl: undefined}
InternalPluginHost.ts:439 [InternalPluginHost] Auth completion received from service
InternalPluginHost.ts:446 [InternalPluginHost] Step 1: Preparing API proxy server
InternalPluginHost.ts:549 [InternalPluginHost] Preparing API proxy with early forum iframe creation
InternalPluginHost.ts:559 [InternalPluginHost] Auto-joining user to selected community: a162cec0-5711-4c45-b58f-547a55837181
InternalPluginHost.ts:1637 [InternalPluginHost] Auto-joining user ens:florianglatz.eth to community a162cec0-5711-4c45-b58f-547a55837181
InternalPluginHost.ts:1647 [ApiProxyClient] Enhanced API request sent: {requestId: 'req_1753788940798_baloixe2d', type: 'direct', url: '/api/communities/a162cec0-5711-4c45-b58f-547a55837181/auto-join'}
VM839 page.tsx:106 [Embed] External parameters received: {}
VM839 page.tsx:107 [Embed] Parent URL received: undefined
VM839 page.tsx:106 [Embed] External parameters received: {}
VM839 page.tsx:107 [Embed] Parent URL received: undefined
VM1434 ApiProxyServer.js:74 [ApiProxyServer] Received enhanced proxy request: {requestId: 'req_1753788940798_baloixe2d', type: 'direct', url: '/api/communities/a162cec0-5711-4c45-b58f-547a55837181/auto-join', method: 'POST'}
VM768 hot-reloader-client.js:241 [Fast Refresh] rebuilding
hot-reloader-client.js:241 [Fast Refresh] rebuilding
VM768 hot-reloader-client.js:68 [Fast Refresh] done in 441ms
hot-reloader-client.js:68 [Fast Refresh] done in 441ms
VM1434 ApiProxyServer.js:311 [ApiProxyServer] Success response sent: {requestId: 'req_1753788940798_baloixe2d', success: true}
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788940798_baloixe2d', responseTime: '772ms', success: true}
InternalPluginHost.ts:1666 [InternalPluginHost] 🔄 Refreshing sidebar after auto-join response
InternalPluginHost.ts:788 [InternalPluginHost] Skipping sidebar refresh - sidebar not initialized
InternalPluginHost.ts:1676 [InternalPluginHost] 🔄 User visit updated for community: a162cec0-5711-4c45-b58f-547a55837181 (visit #4)
IframeManager.ts:149 [IframeManager] Creating forum iframe
IframeManager.ts:181 [IframeManager] Adding external parameters to forum iframe: {}
IframeManager.ts:187 [IframeManager] Forum URL: http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER
IframeManager.ts:205 [IframeManager] Forum iframe set to fill container (100% x 100%)
IframeManager.ts:212 [ApiProxyClient] Active iframe set: http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER
IframeManager.ts:213 [IframeManager] API proxy client configured for forum iframe: {iframeSrc: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER', hasContentWindow: true}
InternalPluginHost.ts:530 [InternalPluginHost] Iframe switched to: forum {iframeSrc: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER', hasContentWindow: true, iframeUid: 'MDOGMXOOER'}
IframeManager.ts:223 [IframeManager] Forum iframe created and added to container
SessionManager.ts:643 [SessionManager] Using API proxy for database sync (CSP-compliant)
SessionManager.ts:647 [ApiProxyClient] Enhanced API request sent: {requestId: 'req_1753788942756_35x1p31gi', type: 'direct', url: '/api/auth/sessions'}
VM2617 upProfile.ts:536 [UPProfileFetcher] Initialized with 1 RPC endpoints.
VM2684 categoryRegistry.ts:27 [GatingRegistry] Registering category renderer: ethereum_profile
VM2968 cookieDebug.ts:94 🍪 Cookie debug utilities loaded! Use window.cookieDebug in console:
VM2968 cookieDebug.ts:95   window.cookieDebug.listAllCookies()
VM2968 cookieDebug.ts:96   window.cookieDebug.testSetCookie()
VM2968 cookieDebug.ts:97   window.cookieDebug.testGetSharedData()
VM2968 cookieDebug.ts:98   window.cookieDebug.manuallySetSharedCookie("123", "456")
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM2983 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM3356 SidebarActionListener.tsx:64 [SidebarActionListener] Initialized - listening for sidebar actions
VM2315 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
VM2315 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
 🔧 [EXT_PARAMS] No external parameters found
 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
 [AuthContext] AuthService initialized.
 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
 [MessageRouter] API proxy ready notification received
 [InternalPluginHost] API proxy ready notification received
 [SessionManager] 🚀 Triggering initial database sync (API proxy ready)
 [SessionManager] Using API proxy for database sync (CSP-compliant)
 [ApiProxyClient] Enhanced API request sent: {requestId: 'req_1753788944390_o1hwpfw64', type: 'direct', url: '/api/auth/sessions'}
InternalPluginHost.ts:577 [InternalPluginHost] API proxy ready notification received - ready for API calls
InternalPluginHost.ts:581 [InternalPluginHost] Tracking proxy iframe for community: a162cec0-5711-4c45-b58f-547a55837181
InternalPluginHost.ts:586 [InternalPluginHost] API proxy prepared - forum iframe ready for API calls
InternalPluginHost.ts:450 [InternalPluginHost] Step 2: Fetching community/profile data via API proxy
InternalPluginHost.ts:705 [InternalPluginHost] Initializing community navigation
AuthenticationService.ts:261 [AuthenticationService] Fetching user communities...
AuthenticationService.ts:271 [AuthenticationService] Using API proxy with retry logic for communities
AuthenticationService.ts:123 [AuthenticationService] 🔄 Starting multi-phase API proxy calls for getUserCommunities (19 attempts over 3s)
AuthenticationService.ts:142 [AuthenticationService] 🎯 Phase1 attempt 1/19 for getUserCommunities (0ms elapsed)
AuthenticationService.ts:152 [AuthenticationService] 🔄 Making internal API call for getUserCommunities (no signature required)
AuthenticationService.ts:154 [ApiProxyClient] API request sent: {requestId: 'req_1753788944390_a104a9ffh', method: 'getUserCommunities', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
AuthenticationService.ts:321 [AuthenticationService] Using API proxy with retry logic for profile
AuthenticationService.ts:123 [AuthenticationService] 🔄 Starting multi-phase API proxy calls for getUserProfile (19 attempts over 3s)
AuthenticationService.ts:142 [AuthenticationService] 🎯 Phase1 attempt 1/19 for getUserProfile (0ms elapsed)
AuthenticationService.ts:152 [AuthenticationService] 🔄 Making internal API call for getUserProfile (no signature required)
AuthenticationService.ts:154 [ApiProxyClient] API request sent: {requestId: 'req_1753788944391_igwgsj6gu', method: 'getUserProfile', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM3356 SidebarActionListener.tsx:69 [SidebarActionListener] Cleaned up message listener
VM3357 theme-provider.tsx:63 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'light', cgTheme: 'light', backgroundForcedTheme: null}
VM3357 theme-provider.tsx:79 [CgThemeSynchronizer] Setting up background theme event listener
VM3357 theme-provider.tsx:94 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'light', urlTheme: 'light', backgroundForcedTheme: null, effectiveTheme: 'light', shouldChange: false}
VM3357 theme-provider.tsx:106 [CgThemeSynchronizer] Theme already correct, no change needed
VM3357 theme-provider.tsx:112 [CgThemeSynchronizer] Setting global effective theme: light
VM2983 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM3356 SidebarActionListener.tsx:64 [SidebarActionListener] Initialized - listening for sidebar actions
VM2315 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
VM2315 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM2315 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM3357 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM2984 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM2984 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM1894 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM1897 CgLibContext.tsx:86 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
VM1897 CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
VM1897 CgLibContext.tsx:112 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
VM3357 theme-provider.tsx:83 [CgThemeSynchronizer] Removing background theme event listener
VM3356 SidebarActionListener.tsx:69 [SidebarActionListener] Cleaned up message listener
VM3357 theme-provider.tsx:63 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'light', cgTheme: 'light', backgroundForcedTheme: null}
VM3357 theme-provider.tsx:79 [CgThemeSynchronizer] Setting up background theme event listener
VM3357 theme-provider.tsx:94 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'light', urlTheme: 'light', backgroundForcedTheme: null, effectiveTheme: 'light', shouldChange: false}
VM3357 theme-provider.tsx:106 [CgThemeSynchronizer] Theme already correct, no change needed
VM3357 theme-provider.tsx:112 [CgThemeSynchronizer] Setting global effective theme: light
VM2983 AppInitializer.tsx:24 [AppInitializer] CgLib is still initializing. Waiting...
VM3356 SidebarActionListener.tsx:64 [SidebarActionListener] Initialized - listening for sidebar actions
VM2315 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
VM2315 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM2315 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM3357 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM2984 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM2984 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM1894 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM1897 CgLibContext.tsx:86 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
VM1897 CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
VM1897 CgLibContext.tsx:112 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2640 SocketContext.tsx:94 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
VM2640 SocketContext.tsx:102 [SocketContext DEBUG] No partnerships data or empty array
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM2315 BackgroundContext.tsx:120 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
VM3356 SidebarActionListener.tsx:69 [SidebarActionListener] Cleaned up message listener
VM2983 AppInitializer.tsx:95 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
VM3356 SidebarActionListener.tsx:64 [SidebarActionListener] Initialized - listening for sidebar actions
VM2315 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
VM2315 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM2315 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM3357 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM2984 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM2984 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
VM1894 AuthContext.tsx:265 [AuthContext] AuthService initialized.
VM1897 CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: MDOGMXOOER, publicKey set: true
VM1897 CgLibContext.tsx:117 [CgLibContext] Attempting to initialize CgPluginLib with iframeUid: MDOGMXOOER
VM1897 CgLibContext.tsx:122 [CgLibContext] Using signing endpoint: http://localhost:3000/api/sign
VM1900 CgPluginLib.js:71 [CgPluginLib] Initialized with iframeUid: MDOGMXOOER
VM3356 SidebarActionListener.tsx:69 [SidebarActionListener] Cleaned up message listener
VM2983 AppInitializer.tsx:95 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
VM3356 SidebarActionListener.tsx:64 [SidebarActionListener] Initialized - listening for sidebar actions
VM2315 BackgroundContext.tsx:87 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
VM2315 BackgroundContext.tsx:104 [BackgroundContext] No backgrounds available
VM2315 BackgroundContext.tsx:131 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
VM3357 theme-provider.tsx:75 [CgThemeSynchronizer] Background forced theme changed: null
VM2984 ExternalParamsContext.tsx:61 🔧 [EXT_PARAMS] No external parameters found
VM2984 ExternalParamsContext.tsx:71 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788944391_igwgsj6gu', responseTime: '52ms', success: true}
AuthenticationService.ts:158 [AuthenticationService] ✅ API proxy SUCCESS for getUserProfile on Phase1 attempt 1 (52ms total)
AuthenticationService.ts:327 [AuthenticationService] API proxy profile success
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788944390_o1hwpfw64', responseTime: '54ms', success: undefined}
SessionManager.ts:651 [SessionManager] API proxy database sync success: 0 sessions
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: c632f0cb0a46aa5a4e6967574d53e504f74e94d2ef349eaa78da173fb74bf21d
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: dbe18f8b8262c19e2f4bf03a32c8eab0087dce9fdb6d03fda05cb8a8b27996e1
SessionManager.ts:686 [SessionManager] Database sync completed: 3 sessions
VM856 SessionManager.ts:396 [SessionManager] Cross-tab sync: Session state updated from other tab
SessionManager.ts:557 [SessionManager] Cross-tab sync: Session state updated from other tab
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788944390_a104a9ffh', responseTime: '55ms', success: true}
AuthenticationService.ts:158 [AuthenticationService] ✅ API proxy SUCCESS for getUserCommunities on Phase1 attempt 1 (55ms total)
AuthenticationService.ts:277 [AuthenticationService] API proxy success: 4 communities
InternalPluginHost.ts:714 [InternalPluginHost] User has 4 communities, showing navigation
InternalPluginHost.ts:715 [MULTI-IFRAME] Community navigation initialized - switching enabled for 4 communities
InternalPluginHost.ts:454 [InternalPluginHost] Step 3: Setting up final layout with sidebar
InternalPluginHost.ts:904 [InternalPluginHost] Switching to forum phase via services
InternalPluginHost.ts:853 [InternalPluginHost] Setting up container layout with dimensions: {width: '100%', height: '100%', configHeight: '100%'}
CommunityItem.ts:129 [MULTI-IFRAME] [OnlineIndicator] Adding online dot for community: flowwolf
UserProfile.ts:80 [UserProfile] 🔧 Updated session cache (menu closed), count: 3
VM1599 intercept-console-error.js:51 [CgPluginLib] Failed to sign request: TypeError: Failed to fetch
    at CgPluginLib.eval (VM1900 CgPluginLib.js:281:40)
    at Generator.next (<anonymous>)
    at eval (VM1900 CgPluginLib.js:20:71)
    at new Promise (<anonymous>)
    at __awaiter (VM1900 CgPluginLib.js:16:12)
    at CgPluginLib.signRequest (VM1900 CgPluginLib.js:275:16)
    at CgPluginLib.eval (VM1900 CgPluginLib.js:221:46)
    at Generator.next (<anonymous>)
    at eval (VM1900 CgPluginLib.js:20:71)
    at new Promise (<anonymous>)
    at __awaiter (VM1900 CgPluginLib.js:16:12)
    at CgPluginLib.makeApiRequest (VM1900 CgPluginLib.js:212:16)
    at CgPluginLib.eval (VM1900 CgPluginLib.js:74:68)
    at Generator.next (<anonymous>)
    at eval (VM1900 CgPluginLib.js:20:71)
    at new Promise (<anonymous>)
    at __awaiter (VM1900 CgPluginLib.js:16:12)
    at CgPluginLib.initialize (VM1900 CgPluginLib.js:58:16)
    at CgLibProvider.useEffect (VM1897 CgLibContext.tsx:123:75)
error @ VM1599 intercept-console-error.js:51
eval @ VM1900 CgPluginLib.js:299
rejected @ VM1900 CgPluginLib.js:18
setupContainerLayout @ InternalPluginHost.ts:891
switchToForum @ InternalPluginHost.ts:913
onAuthComplete @ InternalPluginHost.ts:455
Promise.then
step @ VM1900 CgPluginLib.js:19
eval @ VM1900 CgPluginLib.js:20
__awaiter @ VM1900 CgPluginLib.js:16
signRequest @ VM1900 CgPluginLib.js:275
eval @ VM1900 CgPluginLib.js:221
eval @ VM1900 CgPluginLib.js:20
__awaiter @ VM1900 CgPluginLib.js:16
makeApiRequest @ VM1900 CgPluginLib.js:212
eval @ VM1900 CgPluginLib.js:74
eval @ VM1900 CgPluginLib.js:20
__awaiter @ VM1900 CgPluginLib.js:16
initialize @ VM1900 CgPluginLib.js:58
CgLibProvider.useEffect @ VM1897 CgLibContext.tsx:123
VM1900 CgPluginLib.js:79 [CgPluginLib] Failed to fetch context data during initialization: Error: Failed to sign request: Failed to fetch
    at CgPluginLib.eval (VM1900 CgPluginLib.js:300:23)
    at Generator.throw (<anonymous>)
    at rejected (VM1900 CgPluginLib.js:18:65)
eval @ VM1900 CgPluginLib.js:79
rejected @ VM1900 CgPluginLib.js:18
setupContainerLayout @ InternalPluginHost.ts:891
switchToForum @ InternalPluginHost.ts:913
onAuthComplete @ InternalPluginHost.ts:455
Promise.then
step @ VM1900 CgPluginLib.js:19
eval @ VM1900 CgPluginLib.js:20
__awaiter @ VM1900 CgPluginLib.js:16
initialize @ VM1900 CgPluginLib.js:58
CgLibProvider.useEffect @ VM1897 CgLibContext.tsx:123

VM1897 CgLibContext.tsx:126 [CgLibContext] CgPluginLib initialized successfully.
CommunitySidebar.ts:424 [CommunitySidebar] Updating embed container reference for mobile boundaries
InternalPluginHost.ts:1191 [InternalPluginHost] Global keyboard shortcuts enabled (Cmd+K for search)
InternalPluginHost.ts:927 [InternalPluginHost] Reusing existing forum iframe from API proxy preparation
InternalPluginHost.ts:961 [ApiProxyClient] Active iframe set: http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER
InternalPluginHost.ts:962 [InternalPluginHost] API proxy confirmed for final forum iframe
InternalPluginHost.ts:964 [InternalPluginHost] Forum phase setup complete
upProfile.ts:90 [UPProfileFetcher] Initialized with 1 RPC endpoints.
categoryRegistry.ts:36 [GatingRegistry] Registering category renderer: ethereum_profile
cookieDebug.ts:129 🍪 Cookie debug utilities loaded! Use window.cookieDebug in console:
cookieDebug.ts:130   window.cookieDebug.listAllCookies()
cookieDebug.ts:131   window.cookieDebug.testSetCookie()
cookieDebug.ts:132   window.cookieDebug.testGetSharedData()
cookieDebug.ts:133   window.cookieDebug.manuallySetSharedCookie("123", "456")
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
AppInitializer.tsx:18 [AppInitializer] CgLib is still initializing. Waiting...
SidebarActionListener.tsx:65 [SidebarActionListener] Initialized - listening for sidebar actions
BackgroundContext.tsx:99 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
BackgroundContext.tsx:121 [BackgroundContext] No backgrounds available
BackgroundContext.tsx:140 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
ExternalParamsContext.tsx:66 🔧 [EXT_PARAMS] No external parameters found
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthContext.tsx:341 [AuthContext] AuthService initialized.
CgLibContext.tsx:90 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
CgLibContext.tsx:115 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
MessageRouter.ts:135 [MessageRouter] API proxy ready notification received
InternalPluginHost.ts:601 [InternalPluginHost] API proxy ready notification received
SessionManager.ts:105 [SessionManager] 🚀 Triggering initial database sync (API proxy ready)
SessionManager.ts:643 [SessionManager] Using API proxy for database sync (CSP-compliant)
SessionManager.ts:647 [ApiProxyClient] Enhanced API request sent: {requestId: 'req_1753788947116_dfrhga8ue', type: 'direct', url: '/api/auth/sessions'}
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
SidebarActionListener.tsx:70 [SidebarActionListener] Cleaned up message listener
theme-provider.tsx:62 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'light', cgTheme: 'light', backgroundForcedTheme: null}
theme-provider.tsx:76 [CgThemeSynchronizer] Setting up background theme event listener
theme-provider.tsx:89 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'light', urlTheme: 'light', backgroundForcedTheme: null, effectiveTheme: 'light', shouldChange: false}
theme-provider.tsx:102 [CgThemeSynchronizer] Theme already correct, no change needed
theme-provider.tsx:109 [CgThemeSynchronizer] Setting global effective theme: light
AppInitializer.tsx:18 [AppInitializer] CgLib is still initializing. Waiting...
SidebarActionListener.tsx:65 [SidebarActionListener] Initialized - listening for sidebar actions
BackgroundContext.tsx:99 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
BackgroundContext.tsx:121 [BackgroundContext] No backgrounds available
BackgroundContext.tsx:140 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
theme-provider.tsx:72 [CgThemeSynchronizer] Background forced theme changed: null
ExternalParamsContext.tsx:66 🔧 [EXT_PARAMS] No external parameters found
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthContext.tsx:341 [AuthContext] AuthService initialized.
CgLibContext.tsx:90 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
CgLibContext.tsx:115 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
theme-provider.tsx:79 [CgThemeSynchronizer] Removing background theme event listener
SidebarActionListener.tsx:70 [SidebarActionListener] Cleaned up message listener
theme-provider.tsx:62 [CgThemeSynchronizer] Component mounted, initial state: {theme: 'light', cgTheme: 'light', backgroundForcedTheme: null}
theme-provider.tsx:76 [CgThemeSynchronizer] Setting up background theme event listener
theme-provider.tsx:89 [CgThemeSynchronizer] Theme calculation: {currentTheme: 'light', urlTheme: 'light', backgroundForcedTheme: null, effectiveTheme: 'light', shouldChange: false}
theme-provider.tsx:102 [CgThemeSynchronizer] Theme already correct, no change needed
theme-provider.tsx:109 [CgThemeSynchronizer] Setting global effective theme: light
AppInitializer.tsx:18 [AppInitializer] CgLib is still initializing. Waiting...
SidebarActionListener.tsx:65 [SidebarActionListener] Initialized - listening for sidebar actions
BackgroundContext.tsx:99 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
BackgroundContext.tsx:121 [BackgroundContext] No backgrounds available
BackgroundContext.tsx:140 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
theme-provider.tsx:72 [CgThemeSynchronizer] Background forced theme changed: null
ExternalParamsContext.tsx:66 🔧 [EXT_PARAMS] No external parameters found
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthContext.tsx:341 [AuthContext] AuthService initialized.
CgLibContext.tsx:90 [CgLibContext] Setting iframeUid from params: MDOGMXOOER
CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: null, publicKey set: true
CgLibContext.tsx:115 [CgLibContext] iframeUid is not yet available or is null. Waiting to initialize.
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
SocketContext.tsx:155 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: undefined, partnershipsResponse: undefined, hasData: false, dataLength: 0}
SocketContext.tsx:164 [SocketContext DEBUG] No partnerships data or empty array
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
BackgroundContext.tsx:133 [BackgroundContext] Calculating effectiveTheme: system=light, forced=undefined, result=light
SidebarActionListener.tsx:70 [SidebarActionListener] Cleaned up message listener
AppInitializer.tsx:99 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
SidebarActionListener.tsx:65 [SidebarActionListener] Initialized - listening for sidebar actions
BackgroundContext.tsx:99 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
BackgroundContext.tsx:121 [BackgroundContext] No backgrounds available
BackgroundContext.tsx:140 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
theme-provider.tsx:72 [CgThemeSynchronizer] Background forced theme changed: null
ExternalParamsContext.tsx:66 🔧 [EXT_PARAMS] No external parameters found
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthContext.tsx:341 [AuthContext] AuthService initialized.
CgLibContext.tsx:98 [CgLibContext] Initialize effect triggered. Current iframeUid: MDOGMXOOER, publicKey set: true
CgLibContext.tsx:121 [CgLibContext] Attempting to initialize CgPluginLib with iframeUid: MDOGMXOOER
CgLibContext.tsx:127 [CgLibContext] Using signing endpoint: http://localhost:3000/api/sign
CgLibContext.tsx:129 [CgPluginLib] Initialized with iframeUid: MDOGMXOOER
SidebarActionListener.tsx:70 [SidebarActionListener] Cleaned up message listener
AppInitializer.tsx:99 [AppInitializer] Waiting for CgInstance or iframeUid to become available.
SidebarActionListener.tsx:65 [SidebarActionListener] Initialized - listening for sidebar actions
BackgroundContext.tsx:99 [BackgroundContext] Background priority check: {userBackground: 'none', communityBackground: 'none', userDisablesCommunity: false, cgTheme: 'light'}
BackgroundContext.tsx:121 [BackgroundContext] No backgrounds available
BackgroundContext.tsx:140 [BackgroundContext] Dispatching background theme change: undefined {activeBackground: 'null', hasForceTheme: false, forceThemeValue: undefined}
theme-provider.tsx:72 [CgThemeSynchronizer] Background forced theme changed: null
ExternalParamsContext.tsx:66 🔧 [EXT_PARAMS] No external parameters found
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
CgPluginLib.js:292 [CgPluginLib] Request signed successfully
CgPluginLib.js:249 [CgPluginLib] Sent getContextData request: {type: 'api_request', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947136_u603dvaag', method: 'getContextData', params: undefined, …}
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788947116_dfrhga8ue', responseTime: '39ms', success: undefined}
SessionManager.ts:651 [SessionManager] API proxy database sync success: 0 sessions
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: c632f0cb0a46aa5a4e6967574d53e504f74e94d2ef349eaa78da173fb74bf21d
SessionManager.ts:716 [SessionManager] 🔧 Preserving local session not yet in database: dbe18f8b8262c19e2f4bf03a32c8eab0087dce9fdb6d03fda05cb8a8b27996e1
UserProfile.ts:80 [UserProfile] 🔧 Updated session cache (menu closed), count: 3
SessionManager.ts:686 [SessionManager] Database sync completed: 3 sessions
MessageRouter.ts:164 [MessageRouter] API request: getContextData undefined
MessageRouter.ts:185 [MessageRouter] 🔐 Validating signature (frontend Web Crypto API)
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947136_u603dvaag",
  "method": "getContextData",
  "signature": "jD+a/Ya3kK7YiRghCUTUPERHZB3yAw9eDSoo0/rxjRZUAfniXh+iq7KVVnLUF1oq4TbQTZhd4x9A/N+uk0nY0DVp5tAHTYD5yAF+4daaDy7PKmuyZr+n3UylAoXdbGo54QjwXIgUn4CvFX4FlOQDL1PZG5M5mvDruwoX507k8bCxS8XSWEYMNBUbB/nNi/ncNsCiWkcSRSsIcoSNlRcndRbi7STZS48gur727W68zLLTfBWc8ZujXNAa07PXjV6tHhNd7mgXqVQasEvIVlMVoxV+jnW0ylZJmoj2O5U8ZRJ+p6GScmrctSoBHBBIsVpHVajbHJaIY+tcv1eqOHwf4g==",
  "timestamp": 1753788947136
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getContextData",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947136_u603dvaag",
  "timestamp": 1753788947136
}
MessageRouter.ts:214 [MessageRouter] 🔍 DEBUG - Signature length: 344
FrontendSignatureValidator.ts:54 [FrontendSignatureValidator] Initializing with public key...
SessionManager.ts:557 [SessionManager] Cross-tab sync: Session state updated from other tab
FrontendSignatureValidator.ts:59 [FrontendSignatureValidator] ✅ Initialized successfully
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getContextData', hasTimestamp: true, dataKeys: Array(4)}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOGMXOOER",
  "method": "getContextData",
  "requestId": "req_1753788947136_u603dvaag",
  "timestamp": 1753788947136
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOGMXOOER","method":"getContextData","requestId":"req_1753788947136_u603dvaag","timestamp":1753788947136}
FrontendSignatureValidator.ts:102 [FrontendSignatureValidator] 🔍 DEBUG - Serialized length: 120
FrontendSignatureValidator.ts:124 [FrontendSignatureValidator] 🔍 Using signature algorithm: {
  "name": "RSASSA-PKCS1-v1_5"
}
FrontendSignatureValidator.ts:133 [FrontendSignatureValidator] ✅ Signature validation result: true
MessageRouter.ts:234 [MessageRouter] ✅ Frontend signature validation passed
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getContextData
MessageRouter.ts:276 [MessageRouter] Auth context: {communityId: 'a162cec0-5711-4c45-b58f-547a55837181', userId: 'ens:florianglatz.eth'}
MessageRouter.ts:280 [MessageRouter] Signature present: true
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getContextData" using community context: a162cec0-5711-4c45-b58f-547a55837181
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753788947156_99luyrxri', method: 'getContextData', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
hot-reloader-client.js:241 [Fast Refresh] rebuilding
VM5191:5 Model-viewer ES module imported successfully
VM5191:7 model-viewer custom element is available
page.tsx:158 [HomePage] 🔍 Running shared content detection...
cookieUtils.ts:35 [cookieUtils] Checking for shared content...
cookieUtils.ts:38 [cookieUtils] All cookies: adminer_version=5.3.0
cookieUtils.ts:43 [cookieUtils] No shared_post_data cookie found
page.tsx:176 [HomePage] No shared content detected
cookieUtils.ts:91 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
cookieUtils.ts:100 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
page.tsx:158 [HomePage] 🔍 Running shared content detection...
cookieUtils.ts:35 [cookieUtils] Checking for shared content...
cookieUtils.ts:38 [cookieUtils] All cookies: adminer_version=5.3.0
cookieUtils.ts:43 [cookieUtils] No shared_post_data cookie found
page.tsx:176 [HomePage] No shared content detected
cookieUtils.ts:91 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
cookieUtils.ts:100 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
AppInitializer.tsx:18 [AppInitializer] CgLib is still initializing. Waiting...
ExternalParamsContext.tsx:74 🔧 [EXT_PARAMS] Waiting for user authentication before processing...
AuthContext.tsx:341 [AuthContext] AuthService initialized.
hot-reloader-client.js:68 [Fast Refresh] done in 536ms
ApiProxyClient.ts:464 [ApiProxyClient] API response received: {requestId: 'req_1753788947156_99luyrxri', responseTime: '598ms', success: true}
MessageRouter.ts:291 [MessageRouter] API proxy response: {data: {…}, success: true}
MessageRouter.ts:319 [MessageRouter] Response sent for request: req_1753788947136_u603dvaag
CgPluginLib.js:329 [CgPluginLib] Received response for req_1753788947136_u603dvaag: {type: 'api_response', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947136_u603dvaag', data: {…}}
CgPluginLib.js:76 [CgPluginLib] Context data cached successfully
CgLibContext.tsx:132 [CgLibContext] CgPluginLib initialized successfully.
AppInitializer.tsx:29 [AppInitializer] CgInstance and iframeUid available. Attempting to fetch user data and login.
page.tsx:158 [HomePage] 🔍 Running shared content detection...
cookieUtils.ts:35 [cookieUtils] Checking for shared content...
cookieUtils.ts:38 [cookieUtils] All cookies: adminer_version=5.3.0
cookieUtils.ts:43 [cookieUtils] No shared_post_data cookie found
page.tsx:176 [HomePage] No shared content detected
cookieUtils.ts:91 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
cookieUtils.ts:100 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
AuthContext.tsx:341 [AuthContext] AuthService initialized.
page.tsx:158 [HomePage] 🔍 Running shared content detection...
cookieUtils.ts:35 [cookieUtils] Checking for shared content...
cookieUtils.ts:38 [cookieUtils] All cookies: adminer_version=5.3.0
cookieUtils.ts:43 [cookieUtils] No shared_post_data cookie found
page.tsx:176 [HomePage] No shared content detected
cookieUtils.ts:91 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
cookieUtils.ts:100 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
CgPluginLib.js:292 [CgPluginLib] Request signed successfully
CgPluginLib.js:249 [CgPluginLib] Sent getUserInfo request: {type: 'api_request', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947756_cw3rowwc9', method: 'getUserInfo', params: undefined, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserInfo undefined
MessageRouter.ts:185 [MessageRouter] 🔐 Validating signature (frontend Web Crypto API)
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947756_cw3rowwc9",
  "method": "getUserInfo",
  "signature": "gLyFQOcI9y4yrCRCl1ABFZWWyapSRM34qTUm+qnGM4xFp89TnI8MkmX6lop2CRMY98aPcXSKIfKa+ttB1DfejKVKXWubkRMUDPoQxaDKCM6ynO+xW+iEVM3dIVmCbse3JoeQDz+C4gk8u3HuOSPfSP6SkZf5bCSg3Yl/6WOnfeClFonFto5Jqayj4WrhxWPYD3Xh3OOze1fYpxnbgVzdFrf4r4xyFOeWsQxNe1NeWrdCLaR1fqWkt1Gp5v/iQtoxL+ZX0FWzCVlsG3b6nskaVYhv5Uxsrok80QBF6ohwFeQQdJjMoiGwE7dsLOsViduapj8WpSsxNRNCFdsVCHq0eA==",
  "timestamp": 1753788947756
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserInfo",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947756_cw3rowwc9",
  "timestamp": 1753788947756
}
MessageRouter.ts:214 [MessageRouter] 🔍 DEBUG - Signature length: 344
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserInfo', hasTimestamp: true, dataKeys: Array(4)}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOGMXOOER",
  "method": "getUserInfo",
  "requestId": "req_1753788947756_cw3rowwc9",
  "timestamp": 1753788947756
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOGMXOOER","method":"getUserInfo","requestId":"req_1753788947756_cw3rowwc9","timestamp":1753788947756}
FrontendSignatureValidator.ts:102 [FrontendSignatureValidator] 🔍 DEBUG - Serialized length: 117
FrontendSignatureValidator.ts:124 [FrontendSignatureValidator] 🔍 Using signature algorithm: {
  "name": "RSASSA-PKCS1-v1_5"
}
FrontendSignatureValidator.ts:133 [FrontendSignatureValidator] ✅ Signature validation result: true
MessageRouter.ts:234 [MessageRouter] ✅ Frontend signature validation passed
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserInfo
MessageRouter.ts:276 [MessageRouter] Auth context: {communityId: 'a162cec0-5711-4c45-b58f-547a55837181', userId: 'ens:florianglatz.eth'}
MessageRouter.ts:280 [MessageRouter] Signature present: true
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserInfo" using community context: a162cec0-5711-4c45-b58f-547a55837181
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753788947766_rcjowu96y', method: 'getUserInfo', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
CgPluginLib.js:292 [CgPluginLib] Request signed successfully
CgPluginLib.js:249 [CgPluginLib] Sent getCommunityInfo request: {type: 'api_request', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947759_zvswpzunc', method: 'getCommunityInfo', params: undefined, …}
MessageRouter.ts:164 [MessageRouter] API request: getCommunityInfo undefined
MessageRouter.ts:185 [MessageRouter] 🔐 Validating signature (frontend Web Crypto API)
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947759_zvswpzunc",
  "method": "getCommunityInfo",
  "signature": "M0QM1k+auavrKsVg3SYXmqZ2CCMTO7Bp8m6hQcroW1LUIzsKbHbrynnd/1w89G0Ezlcx2urGtDx6uFwz0BTCTEgJc7w/V4Tu4PZPY11pIVkDbvnnz5Iu/fUFFeaVT919kbs7AvnKlXErfnjEOfEjwAZz4UZPxqlKfNl4UbiH45d2QToNCyFAmo8EV9PZ7mxi0ZTeCGmBp9KJAzt934iwcxrtPgzhpbM/FC7Svzje/J5i3HHKH0xsRkSPfBsyCJh6635LReC+CV1FOL5FIWxY1ZNnmV54x6yR2T/PxvIe0lKDGdpD9tMT4uBSV0WF6xeavsa3jazU6ONKoLQLMcCvTA==",
  "timestamp": 1753788947759
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getCommunityInfo",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947759_zvswpzunc",
  "timestamp": 1753788947759
}
MessageRouter.ts:214 [MessageRouter] 🔍 DEBUG - Signature length: 344
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getCommunityInfo', hasTimestamp: true, dataKeys: Array(4)}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOGMXOOER",
  "method": "getCommunityInfo",
  "requestId": "req_1753788947759_zvswpzunc",
  "timestamp": 1753788947759
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOGMXOOER","method":"getCommunityInfo","requestId":"req_1753788947759_zvswpzunc","timestamp":1753788947759}
FrontendSignatureValidator.ts:102 [FrontendSignatureValidator] 🔍 DEBUG - Serialized length: 122
FrontendSignatureValidator.ts:124 [FrontendSignatureValidator] 🔍 Using signature algorithm: {
  "name": "RSASSA-PKCS1-v1_5"
}
FrontendSignatureValidator.ts:133 [FrontendSignatureValidator] ✅ Signature validation result: true
MessageRouter.ts:234 [MessageRouter] ✅ Frontend signature validation passed
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getCommunityInfo
MessageRouter.ts:276 [MessageRouter] Auth context: {communityId: 'a162cec0-5711-4c45-b58f-547a55837181', userId: 'ens:florianglatz.eth'}
 [MessageRouter] Signature present: true
 [MULTI-IFRAME] [MessageRouter] API request "getCommunityInfo" using community context: a162cec0-5711-4c45-b58f-547a55837181
 [ApiProxyClient] API request sent: {requestId: 'req_1753788947772_43bmo4hk9', method: 'getCommunityInfo', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
 [ApiProxyClient] API response received: {requestId: 'req_1753788947766_rcjowu96y', responseTime: '12ms', success: true}
 [MessageRouter] API proxy response: {data: {…}, success: true}
 [MessageRouter] Response sent for request: req_1753788947756_cw3rowwc9
 [CgPluginLib] Received response for req_1753788947756_cw3rowwc9: {type: 'api_response', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947756_cw3rowwc9', data: {…}}
 [CgPluginLib] Request signed successfully
 [CgPluginLib] Sent getCommunityInfo request: {type: 'api_request', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947779_f1b409pao', method: 'getCommunityInfo', params: undefined, …}
 [MessageRouter] API request: getCommunityInfo undefined
 [MessageRouter] 🔐 Validating signature (frontend Web Crypto API)
 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947779_f1b409pao",
  "method": "getCommunityInfo",
  "signature": "gpOuWRJeCsZLvZu6GghpZ4ev1opLYnmCdSPh6siFrucNiK1QQByV1C6NK4isQDJp4JH22mqK9wDLuvdrmZCz9isxZNqoQjFxAsX0c2fplCHFk95zV/ijdM747USH1x07+pVzRBlaN4ikb7aDZ9wfLubCAp8tDFKMeZKM1Mbmpq3XJm9Tqzt4lg1Zz6hSYoJ02k5Ha0asZNgqxkIWTnoMqOAey+BUjmR3xJILTAdH5XV/PoOFUO8Ab31w+/VKraIj7EyGTF/IhIkyzyzYebrPbnC06FVohhxnFtTiEvBs0pZIhfpdx0i0lFypXwLZ9jvIdme3LKDhT9urk/K7FM+lRg==",
  "timestamp": 1753788947779
}
 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getCommunityInfo",
  "iframeUid": "MDOGMXOOER",
  "requestId": "req_1753788947779_f1b409pao",
  "timestamp": 1753788947779
}
 [MessageRouter] 🔍 DEBUG - Signature length: 344
 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getCommunityInfo', hasTimestamp: true, dataKeys: Array(4)}
 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOGMXOOER",
  "method": "getCommunityInfo",
  "requestId": "req_1753788947779_f1b409pao",
  "timestamp": 1753788947779
}
 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOGMXOOER","method":"getCommunityInfo","requestId":"req_1753788947779_f1b409pao","timestamp":1753788947779}
 [FrontendSignatureValidator] 🔍 DEBUG - Serialized length: 122
 [FrontendSignatureValidator] 🔍 Using signature algorithm: {
  "name": "RSASSA-PKCS1-v1_5"
}
 [FrontendSignatureValidator] ✅ Signature validation result: true
 [MessageRouter] ✅ Frontend signature validation passed
 [MessageRouter] Making API request via proxy: getCommunityInfo
 [MessageRouter] Auth context: {communityId: 'a162cec0-5711-4c45-b58f-547a55837181', userId: 'ens:florianglatz.eth'}
 [MessageRouter] Signature present: true
 [MULTI-IFRAME] [MessageRouter] API request "getCommunityInfo" using community context: a162cec0-5711-4c45-b58f-547a55837181
 [ApiProxyClient] API request sent: {requestId: 'req_1753788947786_aq399vl5h', method: 'getCommunityInfo', userId: 'ens:florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181'}
 [Fast Refresh] rebuilding
 [Fast Refresh] done in 414ms
 [ApiProxyClient] API response received: {requestId: 'req_1753788947772_43bmo4hk9', responseTime: '451ms', success: true}
 [MessageRouter] API proxy response: {data: {…}, success: true}
 [MessageRouter] Response sent for request: req_1753788947759_zvswpzunc
 [CgPluginLib] Received response for req_1753788947759_zvswpzunc: {type: 'api_response', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947759_zvswpzunc', data: {…}}
 [ApiProxyClient] API response received: {requestId: 'req_1753788947786_aq399vl5h', responseTime: '446ms', success: true}
 [MessageRouter] API proxy response: {data: {…}, success: true}
 [MessageRouter] Response sent for request: req_1753788947779_f1b409pao
 [CgPluginLib] Received response for req_1753788947779_f1b409pao: {type: 'api_response', iframeUid: 'MDOGMXOOER', requestId: 'req_1753788947779_f1b409pao', data: {…}}
 [AppInitializer] Extracted context data: {communityShortId: 'wolf', pluginId: 'plugin_a162cec0-5711-4c45-b58f-547a55837181_1753788947752', contextData: {…}}
 [AppInitializer] Data fetched successfully. Calling auth.login() with payload: {userId: 'ens:florianglatz.eth', name: 'florianglatz.eth', profilePictureUrl: 'https://euc.li/florianglatz.eth', roles: Array(1), communityRoles: Array(3), …}
 [AuthContext] LOGIN ATTEMPT. User roles from input: ['member'] Community roles from input: (3) [{…}, {…}, {…}]
 [AuthContext] Skipping friends sync: cgInstance not available, CG lib still initializing, iframeUid not available
 [SessionManager] Using direct fetch for database sync
 [SessionManager] 🔧 Preserving local session not yet in database: c632f0cb0a46aa5a4e6967574d53e504f74e94d2ef349eaa78da173fb74bf21d
 [SessionManager] 🔧 Preserving local session not yet in database: dbe18f8b8262c19e2f4bf03a32c8eab0087dce9fdb6d03fda05cb8a8b27996e1
 [SessionManager] Database sync completed: 3 sessions
 [UserProfile] 🔧 Updated session cache (menu closed), count: 3
 [SessionManager] Cross-tab sync: Session state updated from other tab
 [InternalPluginHost] 🔄 Periodic session service sync...
 [SessionService] Received operation: getAllSessions
 [SessionManager] 🔄 Bulk updating sessions from session service: 3 sessions
 [SessionManager] 🔄 Valid sessions after filtering: 3
 [SessionManager] 🔄 Bulk update completed, no active session change detected
 [SessionManager] ✅ Bulk update completed: 3 sessions, active: a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780
 [InternalPluginHost] 🔄 Periodic sync completed: 3 sessions
 [SessionManager] Cross-tab sync: Session state updated from other tab
 [AuthContext] New token received. Decoded JWT: {sub: 'ens:florianglatz.eth', name: 'florianglatz.eth', picture: 'https://euc.li/florianglatz.eth', adm: false, uid: 'MDOGMXOOER', …}
 [AppInitializer] auth.login() call completed.
 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: 'a162cec0-5711-4c45-b58f-547a55837181', partnershipsResponse: undefined, hasData: false, dataLength: 0}
 [SocketContext DEBUG] No partnerships data or empty array
 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: 'a162cec0-5711-4c45-b58f-547a55837181', partnershipsResponse: undefined, hasData: false, dataLength: 0}
 [SocketContext DEBUG] No partnerships data or empty array
 [BackgroundContext] Fetching user settings for ens:florianglatz.eth
 [BackgroundContext] Fetching community settings for a162cec0-5711-4c45-b58f-547a55837181
 [SocketContext DEBUG] Fetching partnerships for community: a162cec0-5711-4c45-b58f-547a55837181
 [Socket] Transport strategy: websocket, polling (UP active: false, force polling: false)
 [AuthContext] AuthService initialized.
 [Socket] Connected successfully: AheHzD1hGAtZBctKAAAN
 [Socket] User came online (enhanced): {userId: 'ens:florianglatz.eth', userName: 'florianglatz.eth', avatarUrl: 'https://euc.li/florianglatz.eth', communityId: 'a162cec0-5711-4c45-b58f-547a55837181', devices: Array(1), …}
 [Socket] Global presence sync received (enhanced): 0 users online
 [BackgroundContext] Got user settings: []
 [MainLayout] Filtered boards: 1/1 accessible
 [BackgroundContext] Got community response: {id: 'a162cec0-5711-4c45-b58f-547a55837181', name: 'flowwolf', settings: {…}, created_at: '2025-07-15T12:47:31.079Z', updated_at: '2025-07-29T11:35:49.087Z', …}
 [BackgroundContext] Community settings: {}
 [BackgroundContext] Background field: undefined
 [SocketContext DEBUG] Partnership API response: {success: true, data: Array(0), pagination: {…}}
 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: 'a162cec0-5711-4c45-b58f-547a55837181', partnershipsResponse: {…}, hasData: true, dataLength: 0}
 [SocketContext DEBUG] No partnerships data or empty array
 [SocketContext DEBUG] Processing partnerships... {currentCommunityId: 'a162cec0-5711-4c45-b58f-547a55837181', partnershipsResponse: {…}, hasData: true, dataLength: 0}
 [SocketContext DEBUG] No partnerships data or empty array
 [AccessControl] community access granted - role and identity access
 [HomePage] 🔍 Running shared content detection...
 [cookieUtils] Checking for shared content...
 [cookieUtils] All cookies: adminer_version=5.3.0
 [cookieUtils] No shared_post_data cookie found
 [HomePage] No shared content detected
 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
 Creating model-viewer element
 Model-viewer element added successfully
 [HomePage] 🔍 Running shared content detection...
 [cookieUtils] Checking for shared content...
 [cookieUtils] All cookies: adminer_version=5.3.0
 [cookieUtils] No shared_post_data cookie found
 [HomePage] No shared content detected
 (index)browserexpectation(index)browserexpectation0'Chromium/Edge''cookie should be present'1'Safari/iOS''cookie usually blocked by ITP'2'Firefox (strict/private)''cookie likely blocked by ETP'Array(3)
 [cookieUtils] Cookie detection results: {shared_post_data: false, shared_post_data_value: null, all_cookies: 'adminer_version=5.3.0', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Ap…KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', location: 'http://localhost:3000/?mod=standalone&cg_theme=light&cg_bg_color=%23FFFFFF&iframeUid=MDOGMXOOER'}
 Creating model-viewer element
 Model-viewer element added successfully
 [Speech Bubble] Last shown 0.2 hours ago for ens:florianglatz.eth_a162cec0-5711-4c45-b58f-547a55837181
 [Speech Bubble] Can show: false
 [Welcome] Speech bubble frequency limit reached - not showing welcome message
 [MarkdownUtils] Loaded Markdown content
 [PostCard] Filtered boards for move: 1/1 accessible
 [ApiProxyClient] Retrying request: {requestId: 'req_1753788942756_35x1p31gi', retryCount: 1, lastError: 'Request timeout after 10000ms'}
 [ApiProxyClient] API response received: {requestId: 'req_1753788942756_35x1p31gi', responseTime: '11016ms', success: undefined}
 [SessionManager] API proxy database sync success: 0 sessions
 [SessionManager] 🔧 Preserving local session not yet in database: a88fe2de03358eec7c3a162308c7ccd8b48a9057c8c14cc0cdc54772fdb7a780
 [SessionManager] 🔧 Preserving local session not yet in database: c632f0cb0a46aa5a4e6967574d53e504f74e94d2ef349eaa78da173fb74bf21d
 [SessionManager] 🔧 Preserving local session not yet in database: dbe18f8b8262c19e2f4bf03a32c8eab0087dce9fdb6d03fda05cb8a8b27996e1
 [UserProfile] 🔧 Updated session cache (menu closed), count: 3
 [SessionManager] Database sync completed: 3 sessions
 [SessionManager] Cross-tab sync: Session state updated from other tab
