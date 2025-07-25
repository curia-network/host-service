➜  host-service git:(feature/sidebar2) ✗ yarn dev
yarn run v1.22.22
warning ../../../package.json: No license field
$ yarn build:embed && next dev --port 3001
warning ../../../package.json: No license field
$ tsx scripts/build-embed-bundled.ts
[Build] Building embed.js with esbuild...

  public/embed.js      232.1kb
  public/embed.js.map  383.2kb

✅ Built embed.js to public/embed.js (232KB)
💡 Test at: http://localhost:3001/embed.js
   ▲ Next.js 15.1.6
   - Local:        http://localhost:3001
   - Network:      http://192.168.178.45:3001
   - Environments: .env

 ✓ Starting...
 ⚠ Invalid next.config.js options detected: 
 ⚠     Unrecognized key(s) in object: 'appDir' at "experimental"
 ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
 ✓ Ready in 1377ms
 ✓ Compiled /api/auth/sessions in 378ms (331 modules)
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 488ms
 ○ Compiling / ...
 ✓ Compiled / in 1959ms (876 modules)
 GET / 200 in 2110ms
 ✓ Compiled /_not-found in 272ms (866 modules)
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 172ms
 GET / 200 in 61ms
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 8ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 32ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 28ms
 ○ Compiling /embed ...
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
[SessionManager] SSR environment detected, using default storage
[SessionManager] SSR environment detected, skipping legacy migration
[SessionManager] Initialized with 0 sessions
[Embed] External parameters received: {}
[Embed] Parent URL received: undefined
Failed to generate cache key for https://rpc.mainnet.lukso.network
Failed to generate cache key for https://rpc.mainnet.lukso.network
 GET /embed?theme=dark&background_color=%230F172A&mode=full&cg_parent_url=http%253A%252F%252Flocalhost%253A3001%252F 200 in 4774ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 28ms
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 POST /api/auth/validate-session 200 in 870ms
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 469ms
 GET /api/communities 200 in 470ms
 GET / 200 in 114ms
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 11ms
[SessionManager] SSR environment detected, using default storage
[SessionManager] SSR environment detected, skipping legacy migration
[SessionManager] Initialized with 0 sessions
[Embed] External parameters received: {}
[Embed] Parent URL received: undefined
Failed to generate cache key for https://rpc.mainnet.lukso.network
Failed to generate cache key for https://rpc.mainnet.lukso.network
 GET /embed?theme=dark&background_color=%230F172A&mode=full&cg_parent_url=http%253A%252F%252Flocalhost%253A3001%252F 200 in 208ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 220ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 7ms
 POST /api/auth/validate-session 200 in 27ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 21ms
 GET /api/communities 200 in 22ms
 OPTIONS /api/communities 200 in 7ms
 OPTIONS /api/auth/validate-session 200 in 7ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 POST /api/auth/validate-session 200 in 8ms
 GET /api/communities 200 in 10ms
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 OPTIONS /api/user 200 in 569ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getContextData',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:14.637Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getContextData',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 16ms
 OPTIONS /api/user 200 in 2ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getUserInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:14.683Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getUserInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 10ms
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 ⚠ ./node_modules/pino/lib/tools.js
Module not found: Can't resolve 'pino-pretty' in '/Users/florian/Git/curia/host-service/node_modules/pino/lib'

Import trace for requested module:
./node_modules/pino/lib/tools.js
./node_modules/pino/pino.js
./node_modules/@walletconnect/logger/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/node_modules/@walletconnect/universal-provider/dist/index.es.js
./node_modules/@walletconnect/ethereum-provider/dist/index.es.js
./node_modules/@wagmi/connectors/dist/esm/walletConnect.js
./node_modules/@wagmi/connectors/dist/esm/exports/index.js
./node_modules/wagmi/dist/esm/exports/connectors.js
./node_modules/@rainbow-me/rainbowkit/dist/index.js
./src/components/embed/AuthenticationStep.tsx
./src/components/embed/index.ts
./src/app/embed/page.tsx
 OPTIONS /api/communities 200 in 698ms
 OPTIONS /api/community 200 in 704ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:15.401Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 13ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 34ms
 OPTIONS /api/communities 200 in 6ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 12ms
 OPTIONS /api/community 200 in 3ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:16.440Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 10ms
 OPTIONS /api/community 200 in 3ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:18.475Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 12ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 21ms
 OPTIONS /api/community 200 in 2ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T11:00:22.504Z'
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 0
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: 
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----

-----END PRIVATE KEY-
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import failed
[CgPluginLibHost] Failed to import keys: Error: Unable to import keys as either ECDSA P-256 or RSA-2048
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Signature verification error: Error: Failed to import cryptographic keys: Unable to import keys as either ECDSA P-256 or RSA-2048

Key Format Help:
Our library auto-detects and supports both formats:

1. Raw Base64 (most common):
   NEXT_PRIVATE_PRIVKEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49...

2. PEM Format (also supported):
   NEXT_PRIVATE_PRIVKEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"

Troubleshooting:
- Ensure your keys are either raw base64 or PEM format with headers
- Check that private and public keys match and are valid
- Supported algorithms: ECDSA P-256, RSA-2048
- Remove any quotes around environment variables if present

Detection Logic: We detect PEM by looking for '-----BEGIN' headers. 
This heuristic works for 99% of cases but could fail with malformed keys.
    at Generator.throw (<anonymous>)
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 7ms
 OPTIONS /api/communities 200 in 5ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 7ms
 OPTIONS /api/communities 200 in 11ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 8ms
 OPTIONS /api/communities 200 in 4ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 8ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 7ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 15ms
