VM7421 AuthContext.tsx:64 [AuthContext] Fetching ALL friends from CG lib for session sync (with pagination)...
VM7512 friendsSync.ts:16 [friendsSync] Starting paginated fetch of all friends from CG lib...
VM7512 friendsSync.ts:21 [friendsSync] Fetching page 1 (offset: 0, limit: 100)
VM7427 CgPluginLib.js:249 [CgPluginLib] Sent getUserFriends request: {type: 'api_request', iframeUid: 'MDOYXPSB0S', requestId: 'req_1753819663126_e3bak55x3', method: 'getUserFriends', params: {…}, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserFriends {limit: 100, offset: 0}
MessageRouter.ts:189 [MessageRouter] 🔍 DEBUG getUserFriends - Full message: {
  "type": "api_request",
  "iframeUid": "MDOYXPSB0S",
  "requestId": "req_1753819663126_e3bak55x3",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "dHOwlY96gu2iFXr5TQmh0PnjZOTT6j5NS2qiRbcVbeIOwTTW5KizwwSxcw+jvEzjNiqvTdHHwjsqnBqBzkR9OCJw9LfabIT0D3j5uynu8bO3v7TlGbB7yIDtCp9OVLUMVIug7dgSMyh7NFp0AFrc1g2MzWjtKAyIP+lWRSEXn8G6KnPwRXlwyKlgZNWpZwRHWIxXjgtxskRijaVJZpcVhMC/6cU6PVEJ6LxJAzCb7ifwVzF5w2e7YYnZeqGbZ1Ybr6+wr1sE7sPiU2l3XNoNxA5nu2JfumAFh+C+iE0milwg4BKCfTcHj3HPJvmwtG1E+iWXYQSVlXiMQCNgtNZGYQ==",
  "timestamp": 1753819663126
}
MessageRouter.ts:190 [MessageRouter] 🔍 DEBUG getUserFriends - Params structure: {params: {…}, paramsType: 'object', paramsKeys: Array(2)}params: limit: 100offset: 0[[Prototype]]: ObjectparamsKeys: (2) ['limit', 'offset']paramsType: "object"[[Prototype]]: Object
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOYXPSB0S",
  "requestId": "req_1753819663126_e3bak55x3",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "dHOwlY96gu2iFXr5TQmh0PnjZOTT6j5NS2qiRbcVbeIOwTTW5KizwwSxcw+jvEzjNiqvTdHHwjsqnBqBzkR9OCJw9LfabIT0D3j5uynu8bO3v7TlGbB7yIDtCp9OVLUMVIug7dgSMyh7NFp0AFrc1g2MzWjtKAyIP+lWRSEXn8G6KnPwRXlwyKlgZNWpZwRHWIxXjgtxskRijaVJZpcVhMC/6cU6PVEJ6LxJAzCb7ifwVzF5w2e7YYnZeqGbZ1Ybr6+wr1sE7sPiU2l3XNoNxA5nu2JfumAFh+C+iE0milwg4BKCfTcHj3HPJvmwtG1E+iWXYQSVlXiMQCNgtNZGYQ==",
  "timestamp": 1753819663126
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserFriends",
  "iframeUid": "MDOYXPSB0S",
  "requestId": "req_1753819663126_e3bak55x3",
  "timestamp": 1753819663126,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
MessageRouter.ts:218 [MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data: {
  "method": "getUserFriends",
  "iframeUid": "MDOYXPSB0S",
  "requestId": "req_1753819663126_e3bak55x3",
  "timestamp": 1753819663126,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserFriends', hasTimestamp: true, dataKeys: Array(5)}
FrontendSignatureValidator.ts:92 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data: {
  "method": "getUserFriends",
  "iframeUid": "MDOYXPSB0S",
  "requestId": "req_1753819663126_e3bak55x3",
  "timestamp": 1753819663126,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOYXPSB0S",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819663126_e3bak55x3",
  "timestamp": 1753819663126
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOYXPSB0S","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819663126_e3bak55x3","timestamp":1753819663126}
FrontendSignatureValidator.ts:106 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data: {
  "iframeUid": "MDOYXPSB0S",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819663126_e3bak55x3",
  "timestamp": 1753819663126
}
FrontendSignatureValidator.ts:107 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation: {"iframeUid":"MDOYXPSB0S","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819663126_e3bak55x3","timestamp":1753819663126}
MessageRouter.ts:238 [MessageRouter] 🎉 getUserFriends signature validation PASSED!
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserFriends
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserFriends" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753819663140_y229ulxgh', method: 'getUserFriends', userId: 'anon:2b0aa6c58837d891', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}communityId: "1e5fb703-1805-42e7-927e-be3f7855856c"method: "getUserFriends"requestId: "req_1753819663140_y229ulxgh"userId: "anon:2b0aa6c58837d891"[[Prototype]]: Object
VM7512 friendsSync.ts:37 [friendsSync] Page 1 complete: 0 friends (total: 0)
VM7512 friendsSync.ts:55 [friendsSync] Completed paginated fetch: 0 total friends across 1 pages
VM7421 AuthContext.tsx:72 [AuthContext] Fetched 0 total friends from CG lib (paginated)
VM15157 AuthContext.tsx:64 [AuthContext] Fetching ALL friends from CG lib for session sync (with pagination)...
VM15248 friendsSync.ts:16 [friendsSync] Starting paginated fetch of all friends from CG lib...
VM15248 friendsSync.ts:21 [friendsSync] Fetching page 1 (offset: 0, limit: 100)
VM15163 CgPluginLib.js:249 [CgPluginLib] Sent getUserFriends request: {type: 'api_request', iframeUid: 'MDOZ02IL9I', requestId: 'req_1753819769692_rkxxtwde9', method: 'getUserFriends', params: {…}, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserFriends {limit: 100, offset: 0}
MessageRouter.ts:189 [MessageRouter] 🔍 DEBUG getUserFriends - Full message: {
  "type": "api_request",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819769692_rkxxtwde9",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "RwlTYfI/iv5YcMvde41Dt5OUlQt82PODh6/ZBRqWWKP0vX6V5oWDHomhJ8G/0FGE4qwwJxrmvKyIsXcWrcBDGx6KeBVN40+a+wvPCSqKChEUEUcQ2fWg/ctYHG46JAbpHgcmiVTzPMMtoTs/vmrhG4OhyepyWOvCPbGXWsKUgRR+J+RBpx4wJDjeYRxqkkpTFZo7n4FGu+UeSaJ3UMWKiAk8/GBpuIXviWSjZX10psL12j0AaK6LfCj7cBDZkCV1e2u53i8HwpeMxQlXi5R2BpSOcjjvEIYUyvVFUaOY/olFNCEExhDuhIT3Nr0lnx9KHrVQvcU8DjKpsLwt9E1DaQ==",
  "timestamp": 1753819769692
}
MessageRouter.ts:190 [MessageRouter] 🔍 DEBUG getUserFriends - Params structure: {params: {…}, paramsType: 'object', paramsKeys: Array(2)}
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819769692_rkxxtwde9",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "RwlTYfI/iv5YcMvde41Dt5OUlQt82PODh6/ZBRqWWKP0vX6V5oWDHomhJ8G/0FGE4qwwJxrmvKyIsXcWrcBDGx6KeBVN40+a+wvPCSqKChEUEUcQ2fWg/ctYHG46JAbpHgcmiVTzPMMtoTs/vmrhG4OhyepyWOvCPbGXWsKUgRR+J+RBpx4wJDjeYRxqkkpTFZo7n4FGu+UeSaJ3UMWKiAk8/GBpuIXviWSjZX10psL12j0AaK6LfCj7cBDZkCV1e2u53i8HwpeMxQlXi5R2BpSOcjjvEIYUyvVFUaOY/olFNCEExhDuhIT3Nr0lnx9KHrVQvcU8DjKpsLwt9E1DaQ==",
  "timestamp": 1753819769692
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819769692_rkxxtwde9",
  "timestamp": 1753819769692,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
MessageRouter.ts:218 [MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819769692_rkxxtwde9",
  "timestamp": 1753819769692,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserFriends', hasTimestamp: true, dataKeys: Array(5)}
FrontendSignatureValidator.ts:92 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819769692_rkxxtwde9",
  "timestamp": 1753819769692,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOZ02IL9I",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819769692_rkxxtwde9",
  "timestamp": 1753819769692
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOZ02IL9I","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819769692_rkxxtwde9","timestamp":1753819769692}
FrontendSignatureValidator.ts:106 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data: {
  "iframeUid": "MDOZ02IL9I",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819769692_rkxxtwde9",
  "timestamp": 1753819769692
}
FrontendSignatureValidator.ts:107 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation: {"iframeUid":"MDOZ02IL9I","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819769692_rkxxtwde9","timestamp":1753819769692}
MessageRouter.ts:238 [MessageRouter] 🎉 getUserFriends signature validation PASSED!
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserFriends
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserFriends" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753819769705_zbt2ub9y1', method: 'getUserFriends', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
VM15248 friendsSync.ts:37 [friendsSync] Page 1 complete: 0 friends (total: 0)
VM15248 friendsSync.ts:55 [friendsSync] Completed paginated fetch: 0 total friends across 1 pages
VM15157 AuthContext.tsx:72 [AuthContext] Fetched 0 total friends from CG lib (paginated)
AuthContext.tsx:128 [AuthContext] Fetching ALL friends from CG lib for session sync (with pagination)...
friendsSync.ts:35 [friendsSync] Starting paginated fetch of all friends from CG lib...
friendsSync.ts:40 [friendsSync] Fetching page 1 (offset: 0, limit: 100)
CgPluginLib.js:249 [CgPluginLib] Sent getUserFriends request: {type: 'api_request', iframeUid: 'MDOZ02IL9I', requestId: 'req_1753819780681_2cp2427sy', method: 'getUserFriends', params: {…}, …}
MessageRouter.ts:164 [MessageRouter] API request: getUserFriends {limit: 100, offset: 0}
MessageRouter.ts:189 [MessageRouter] 🔍 DEBUG getUserFriends - Full message: {
  "type": "api_request",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819780681_2cp2427sy",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "aAxrYlYmi6h6z92vKuqM4sH2dNfKrNDCV2vVGf0lBF4x6ApiRKrOgOdReN0ZrVFaEf/5E8Omq2ma6b0BEtBr5K5sNVfsOJhadRqpgJvCZ5q8zksAECp090t2LDeCERgYoqYLz4+9hxKZ42vg4RUleLpaInTdsHMniOYrmT4lwpRhHou2a8yF2JKyX79EE2Y77Q+mPp2tw/N0oRmL2GGx6A1M3Fy0HMplEtAIRk/2lHKkAUIcVRA5GFBxf9gTeYYSma5tPd9tBHAd6bwGplCqonFqhqawR6SRGY7LTIikWQFiFKQTm1bO2PaDcqgAnx0zQOuEA0vOvblKcLodpCEbtQ==",
  "timestamp": 1753819780681
}
MessageRouter.ts:190 [MessageRouter] 🔍 DEBUG getUserFriends - Params structure: {params: {…}, paramsType: 'object', paramsKeys: Array(2)}
MessageRouter.ts:212 [MessageRouter] 🔍 DEBUG - Message received: {
  "type": "api_request",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819780681_2cp2427sy",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "signature": "aAxrYlYmi6h6z92vKuqM4sH2dNfKrNDCV2vVGf0lBF4x6ApiRKrOgOdReN0ZrVFaEf/5E8Omq2ma6b0BEtBr5K5sNVfsOJhadRqpgJvCZ5q8zksAECp090t2LDeCERgYoqYLz4+9hxKZ42vg4RUleLpaInTdsHMniOYrmT4lwpRhHou2a8yF2JKyX79EE2Y77Q+mPp2tw/N0oRmL2GGx6A1M3Fy0HMplEtAIRk/2lHKkAUIcVRA5GFBxf9gTeYYSma5tPd9tBHAd6bwGplCqonFqhqawR6SRGY7LTIikWQFiFKQTm1bO2PaDcqgAnx0zQOuEA0vOvblKcLodpCEbtQ==",
  "timestamp": 1753819780681
}
MessageRouter.ts:213 [MessageRouter] 🔍 DEBUG - Data for validation: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819780681_2cp2427sy",
  "timestamp": 1753819780681,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
MessageRouter.ts:218 [MessageRouter] 🔍 DEBUG getUserFriends - About to validate signature with data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819780681_2cp2427sy",
  "timestamp": 1753819780681,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:84 [FrontendSignatureValidator] 🔐 Validating signature for data: {method: 'getUserFriends', hasTimestamp: true, dataKeys: Array(5)}
FrontendSignatureValidator.ts:92 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Original data: {
  "method": "getUserFriends",
  "iframeUid": "MDOZ02IL9I",
  "requestId": "req_1753819780681_2cp2427sy",
  "timestamp": 1753819780681,
  "params": {
    "limit": 100,
    "offset": 0
  }
}
FrontendSignatureValidator.ts:99 [FrontendSignatureValidator] 🔍 DEBUG - Normalized data: {
  "iframeUid": "MDOZ02IL9I",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819780681_2cp2427sy",
  "timestamp": 1753819780681
}
FrontendSignatureValidator.ts:101 [FrontendSignatureValidator] 🔍 DEBUG - Serialized data: {"iframeUid":"MDOZ02IL9I","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819780681_2cp2427sy","timestamp":1753819780681}
FrontendSignatureValidator.ts:106 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Normalized data: {
  "iframeUid": "MDOZ02IL9I",
  "method": "getUserFriends",
  "params": {
    "limit": 100,
    "offset": 0
  },
  "requestId": "req_1753819780681_2cp2427sy",
  "timestamp": 1753819780681
}
FrontendSignatureValidator.ts:107 [FrontendSignatureValidator] 🔍 DEBUG getUserFriends - Serialized for validation: {"iframeUid":"MDOZ02IL9I","method":"getUserFriends","params":{"limit":100,"offset":0},"requestId":"req_1753819780681_2cp2427sy","timestamp":1753819780681}
MessageRouter.ts:238 [MessageRouter] 🎉 getUserFriends signature validation PASSED!
MessageRouter.ts:275 [MessageRouter] Making API request via proxy: getUserFriends
MessageRouter.ts:281 [MULTI-IFRAME] [MessageRouter] API request "getUserFriends" using community context: 1e5fb703-1805-42e7-927e-be3f7855856c
MessageRouter.ts:283 [ApiProxyClient] API request sent: {requestId: 'req_1753819780689_qz4no7npq', method: 'getUserFriends', userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F', communityId: '1e5fb703-1805-42e7-927e-be3f7855856c'}
friendsSync.ts:63 [friendsSync] Page 1 complete: 0 friends (total: 0)
friendsSync.ts:85 [friendsSync] Completed paginated fetch: 0 total friends across 1 pages
AuthContext.tsx:137 [AuthContext] Fetched 0 total friends from CG lib (paginated)
