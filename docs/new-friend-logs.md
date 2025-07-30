VM30923 AuthContext.tsx:64 [AuthContext] Fetching ALL friends from CG lib for session sync (with pagination)...
VM31014 friendsSync.ts:16 [friendsSync] Starting paginated fetch of all friends from CG lib...
VM31014 friendsSync.ts:21 [friendsSync] Fetching page 1 (offset: 0, limit: 100)
VM30929 CgPluginLib.js:249 [CgPluginLib] Sent getUserFriends request: {type: 'api_request', iframeUid: 'MDOZX9I12J', requestId: 'req_1753821324800_m7d8rtxsh', method: 'getUserFriends', params: {…}, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserFriends {limit: 100, offset: 0}
MessageRouter.ts:189 [MessageRouter] 🔍 DEBUG getUserFriends - Full message: {
  "type": "api_request",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821324800_m7d8rtxsh",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "AvqVmmJDpKf1zzd55Vdio70PKJT4UegCFe9BpU0yba9Teh4xdWgswgB05976ygwCc+8bMWfz+5qv8VtwS2Fv5jzGdj1x/N3wbXjp0uY4cwXD1CazRo+UZfdOk9+vd7IhvpmfJxn6EDmjQeEVDquEqxQEOsZZNqFlWh1vVOlyUjfDHcf/s33DQxYEXZPWLhqvGlCSMQYEs2HdP9GqUZVtf1pNsz/rQ/EmNnPJhsyXIzluEAFaRoOZy/Rwyhl+Ml6Dl6+vqv6+rqrXbEd6mKjJ38oZSgaprMbnXONq/66U+/iGQoyTJGJ/3O5tbKSbJ16CYsOZ7kFT8R9BeH7/jwf6lA==",
  "timestamp": 1753821324800
}
MessageRouter.ts:190 [MessageRouter] 🔍 DEBUG getUserFriends - Params structure: {params: {…}, paramsType: 'object', paramsKeys: Array(2)}
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821324800_m7d8rtxsh",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "AvqVmmJDpKf1zzd55Vdio70PKJT4UegCFe9BpU0yba9Teh4xdWgswgB05976ygwCc+8bMWfz+5qv8VtwS2Fv5jzGdj1x/N3wbXjp0uY4cwXD1CazRo+UZfdOk9+vd7IhvpmfJxn6EDmjQeEVDquEqxQEOsZZNqFlWh1vVOlyUjfDHcf/s33DQxYEXZPWLhqvGlCSMQYEs2HdP9GqUZVtf1pNsz/rQ/EmNnPJhsyXIzluEAFaRoOZy/Rwyhl+Ml6Dl6+vqv6+rqrXbEd6mKjJ38oZSgaprMbnXONq/66U+/iGQoyTJGJ/3O5tbKSbJ16CYsOZ7kFT8R9BeH7/jwf6lA==",
  "timestamp": 1753821324800
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821324800_m7d8rtxsh",
  "timestamp": 1753821324800,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
MessageRouter.ts:218 [MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821324800_m7d8rtxsh",
  "timestamp": 1753821324800,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserFriends', hasTimestamp: true, dataKeys: Array(5)}
FrontendSignatureValidator.ts:92 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821324800_m7d8rtxsh",
  "timestamp": 1753821324800,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOZX9I12J",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753821324800_m7d8rtxsh",
  "timestamp": 1753821324800
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOZX9I12J","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753821324800_m7d8rtxsh","timestamp":1753821324800}
FrontendSignatureValidator.ts:106 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data: {
  "iframeUid": "MDOZX9I12J",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753821324800_m7d8rtxsh",
  "timestamp": 1753821324800
}
FrontendSignatureValidator.ts:107 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation: {"iframeUid":"MDOZX9I12J","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753821324800_m7d8rtxsh","timestamp":1753821324800}
MessageRouter.ts:238 [MessageRouter] 🎉 getUserFriends signature validation PASSED!
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserFriends
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserFriends" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753821324809_g6idyy55a', method: 'getUserFriends', userId: 'up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
MessageRouter.ts:302 [MessageRouter] API error: Failed to fetch
error @ intercept-console-error.js:51
handleApiRequest @ MessageRouter.ts:302
await in handleApiRequest
handleMessage @ MessageRouter.ts:145
messageListener @ MessageRouter.ts:94
postMessage
eval @ VM30929 CgPluginLib.js:248
eval @ VM30929 CgPluginLib.js:239
fulfilled @ VM30929 CgPluginLib.js:17
Promise.then
step @ VM30929 CgPluginLib.js:19
eval @ VM30929 CgPluginLib.js:20
__awaiter @ VM30929 CgPluginLib.js:16
makeApiRequest @ VM30929 CgPluginLib.js:212
eval @ VM30929 CgPluginLib.js:156
eval @ VM30929 CgPluginLib.js:20
__awaiter @ VM30929 CgPluginLib.js:16
getUserFriends @ VM30929 CgPluginLib.js:155
fetchAllFriendsFromCgLib @ VM31014 friendsSync.ts:22
AuthProvider.useCallback[performLoginLogic] @ VM30923 AuthContext.tsx:67
AuthProvider.useCallback[login] @ VM30923 AuthContext.tsx:165
AppInitializer.useEffect.fetchDataAndLogin @ VM32012 AppInitializer.tsx:84
await in AppInitializer.useEffect.fetchDataAndLogin
AppInitializer.useEffect @ VM32012 AppInitializer.tsx:92
react-stack-bottom-frame @ VM30645 react-dom-client.development.js:23696
runWithFiberInDEV @ VM30645 react-dom-client.development.js:544
commitHookEffectListMount @ VM30645 react-dom-client.development.js:10764
commitHookPassiveMountEffects @ VM30645 react-dom-client.development.js:10884
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12669
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12739
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12662
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12771
recursivelyTraversePassiveMountEffects @ VM30645 react-dom-client.development.js:12643
commitPassiveMountOnFiber @ VM30645 react-dom-client.development.js:12673
flushPassiveEffects @ VM30645 react-dom-client.development.js:15483
eval @ VM30645 react-dom-client.development.js:15347
performWorkUntilDeadline @ VM30647 scheduler.development.js:44
AuthContext.tsx:128 [AuthContext] Fetching ALL friends from CG lib for session sync (with pagination)...
friendsSync.ts:35 [friendsSync] Starting paginated fetch of all friends from CG lib...
friendsSync.ts:40 [friendsSync] Fetching page 1 (offset: 0, limit: 100)
CgPluginLib.js:249 [CgPluginLib] Sent getUserFriends request: {type: 'api_request', iframeUid: 'MDOZX9I12J', requestId: 'req_1753821336539_joyvdpxyb', method: 'getUserFriends', params: {…}, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserFriends {limit: 100, offset: 0}
MessageRouter.ts:189 [MessageRouter] 🔍 DEBUG getUserFriends - Full message: {
  "type": "api_request",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821336539_joyvdpxyb",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "S2qs5wbQ2aWKaYb3sXF43FnfOvc4vIjpqWsxOaqGYDHu6cG8YOtphRIRiSYR475Qyec6qEdWq6ptbRibCRBUKBHSq0Pdx3YITIlAVTTxgMfciwMCPt1LnR4Uwu5U51tlttnDT6lGDXPy2E2kL6OwEnM5nHFiFbMf3Xi/oYuZsRE++XLz2XjqsdCu5tf5s5Ja8rjBuscZzhQly15hh7cm3/6UT0r7rMpOz/gfcephdx+eUBDBgRmuDZY/Io3aoXr5p2wNIKN4u9ckOv9oWGo5lQ2rk+E+Wu9ep1q/MJXOjJ0uWTi8nuMK4Q90Ek5hDMJyjnvOyaxIUGoFr8d1xKjfUQ==",
  "timestamp": 1753821336539
}
MessageRouter.ts:190 [MessageRouter] 🔍 DEBUG getUserFriends - Params structure: {params: {…}, paramsType: 'object', paramsKeys: Array(2)}
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821336539_joyvdpxyb",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "S2qs5wbQ2aWKaYb3sXF43FnfOvc4vIjpqWsxOaqGYDHu6cG8YOtphRIRiSYR475Qyec6qEdWq6ptbRibCRBUKBHSq0Pdx3YITIlAVTTxgMfciwMCPt1LnR4Uwu5U51tlttnDT6lGDXPy2E2kL6OwEnM5nHFiFbMf3Xi/oYuZsRE++XLz2XjqsdCu5tf5s5Ja8rjBuscZzhQly15hh7cm3/6UT0r7rMpOz/gfcephdx+eUBDBgRmuDZY/Io3aoXr5p2wNIKN4u9ckOv9oWGo5lQ2rk+E+Wu9ep1q/MJXOjJ0uWTi8nuMK4Q90Ek5hDMJyjnvOyaxIUGoFr8d1xKjfUQ==",
  "timestamp": 1753821336539
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821336539_joyvdpxyb",
  "timestamp": 1753821336539,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
MessageRouter.ts:218 [MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821336539_joyvdpxyb",
  "timestamp": 1753821336539,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserFriends', hasTimestamp: true, dataKeys: Array(5)}
FrontendSignatureValidator.ts:92 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZX9I12J",
  "requestId": "req_1753821336539_joyvdpxyb",
  "timestamp": 1753821336539,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOZX9I12J",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753821336539_joyvdpxyb",
  "timestamp": 1753821336539
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOZX9I12J","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753821336539_joyvdpxyb","timestamp":1753821336539}
FrontendSignatureValidator.ts:106 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data: {
  "iframeUid": "MDOZX9I12J",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753821336539_joyvdpxyb",
  "timestamp": 1753821336539
}
FrontendSignatureValidator.ts:107 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation: {"iframeUid":"MDOZX9I12J","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753821336539_joyvdpxyb","timestamp":1753821336539}
MessageRouter.ts:238 [MessageRouter] 🎉 getUserFriends signature validation PASSED!
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserFriends
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserFriends" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753821336551_aooxxnbgs', method: 'getUserFriends', userId: 'up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
