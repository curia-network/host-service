[UPProfileFetcher] Initialized with 1 RPC endpoints.
[GatingRegistry] Registering category renderer: ethereum_profile
[SocketContext DEBUG] Processing partnerships... {
  currentCommunityId: undefined,
  partnershipsResponse: undefined,
  hasData: false,
  dataLength: 0
}
[SocketContext DEBUG] No partnerships data or empty array
[BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
Failed to generate cache key for https://rpc.mainnet.lukso.network
Failed to generate cache key for https://rpc.mainnet.lukso.network
 GET /?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC 200 in 621ms
 GET /favicon.ico 200 in 10ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '120',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getContextData","iframeUid":"MDIT4YP3SC","requestId":"req_1753447251494_07wsuftgt","timestamp":1753447251494}
[Curia Sign API] DEBUG: Body length: 120
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getContextData',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447251494_07wsuftgt',
  timestamp: 1753447251494
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 14ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '117',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getUserInfo","iframeUid":"MDIT4YP3SC","requestId":"req_1753447252695_09o3qn0m2","timestamp":1753447252695}
[Curia Sign API] DEBUG: Body length: 117
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getUserInfo',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447252695_09o3qn0m2',
  timestamp: 1753447252695
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 8ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '122',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getCommunityInfo","iframeUid":"MDIT4YP3SC","requestId":"req_1753447252696_4edqyo9f2","timestamp":1753447252696}
[Curia Sign API] DEBUG: Body length: 122
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getCommunityInfo',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447252696_4edqyo9f2',
  timestamp: 1753447252696
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 12ms
[SocketContext DEBUG] Processing partnerships... {
  currentCommunityId: undefined,
  partnershipsResponse: undefined,
  hasData: false,
  dataLength: 0
}
[SocketContext DEBUG] No partnerships data or empty array
[BackgroundContext] Calculating effectiveTheme: system=dark, forced=undefined, result=dark
 GET /?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC 200 in 11ms
 GET /favicon.ico 200 in 5ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '120',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getContextData","iframeUid":"MDIT4YP3SC","requestId":"req_1753447254783_9x8jm0lxf","timestamp":1753447254783}
[Curia Sign API] DEBUG: Body length: 120
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getContextData',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447254783_9x8jm0lxf',
  timestamp: 1753447254783
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 6ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '117',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getUserInfo","iframeUid":"MDIT4YP3SC","requestId":"req_1753447254806_xhrikagat","timestamp":1753447254806}
[Curia Sign API] DEBUG: Body length: 117
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getUserInfo',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447254806_xhrikagat',
  timestamp: 1753447254806
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 8ms
[Curia Sign API] DEBUG: Request received: {
  method: 'POST',
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'de-DE,de;q=0.7',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'content-length': '122',
    'content-type': 'application/json',
    cookie: 'adminer_key=e41cfad1a06e347ad4c269eba8f53238; adminer_export=output%3Dtext%26format%3Dsql%26db_style%3D%26table_style%3DDROP%252BCREATE%26triggers%3D1%26data_style%3DINSERT; adminer_version=5.3.0; adminer_sid=7e62faf5b0371d22c936e0d8241eed18; adminer_permanent=cGdzcWw%3D-cG9zdGdyZXM%3D-cGx1Z2luX3VzZXI%3D-cGx1Z2luX2Ri%3ARtOMXpeSbSwX5nbMeJ%2F0vkhKqXs%3D+cGdzcWw%3D-Y3Jvc3NvdmVyLnByb3h5LnJsd3kubmV0OjQyNTky-cG9zdGdyZXM%3D-cmFpbHdheQ%3D%3D%3AZ9YEYA5XDDQjFoukhdQ%2F9vSaL3YFuZzTRI5Jk3c2O0ZXlFCM',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    pragma: 'no-cache',
    referer: 'http://localhost:3000/?mod=standalone&cg_theme=dark&cg_bg_color=%230F172A&iframeUid=MDIT4YP3SC',
    'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-forwarded-for': '127.0.0.1',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http'
  },
  hasBody: true
}
[Curia Sign API] DEBUG: Raw body text: {"method":"getCommunityInfo","iframeUid":"MDIT4YP3SC","requestId":"req_1753447255890_60txhgck2","timestamp":1753447255890}
[Curia Sign API] DEBUG: Body length: 122
[Curia Sign API] DEBUG: Parsed body: {
  method: 'getCommunityInfo',
  iframeUid: 'MDIT4YP3SC',
  requestId: 'req_1753447255890_60txhgck2',
  timestamp: 1753447255890
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1704
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Request signed successfully
 POST /api/sign 200 in 12ms
