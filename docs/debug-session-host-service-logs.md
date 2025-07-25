[Host Sign API] Signing request: {
  method: 'getUserProfile',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserProfile",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Initialized with key pair
[CgPluginLibHost] Signing request using RSA-2048 algorithm
[CgPluginLibHost] Signing request using RSA-2048 algorithm
 OPTIONS /api/user 200 in 1030ms
[CgPluginLibHost] Request signed successfully
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 1204ms
[CgPluginLibHost] Request signed successfully
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 1203ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getContextData',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:52.684Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getContextData",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "PQcW7F5ag9QdupjvzAl9weh7JEm+O9DeNTvtwM02Ja4ITrD+iI7OK35A7qhUT1j+ZZvWRY22B4t7jThwftwrGYfvCes+ecktH6PQX9L9a/IHEYL72POWUB1Z7NJkewHjLH/Me86lIEThnC72EK8Wz7BrhM+s138xVedebNVWioAQlK7IA0Q954TYp0a2n1S5bkZ/VeX/yXAkvVPtDnjYH0Qrvlz6l+aYSg0NfOdGvUzb6/esAI6hVikX28iVDQugoSdyav/qPjAo1mFGldDXqkqW0RqgQSVgSy9WfSC1cYVe/dKohnz8rcGnSLcCEDneZJWAosZaLFL2Er1SBJyEbQ=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getContextData',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 3ms
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
 OPTIONS /api/communities 200 in 545ms
 OPTIONS /api/auth/validate-session 200 in 548ms
 OPTIONS /api/community 200 in 526ms
 OPTIONS /api/user 200 in 535ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:53.246Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getCommunityInfo",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "Og6IpFcWI1Zj28WqUEtwYfv8woEh7kmLAM0ckoCip81dmGmcB+yXT9VmH2yXJcaHYLT0s4Zw2jdr271qiLjQsgmkDJ6e4xG7ZgUlYD7T1bCGWDNZS8N4vXUrJo926Ylrhae/EGkBN3HgVmVhrQaZu90BPEBkoF6tW7EQ0yn5FGO96usKNJ5rec8cV6kMDrNSCcZA3w08TPbJJq1Zjs1VC88j5xmGQ5do7XlYJ62I8pajZtmRB/JdNpZJbLNXm2DBv00cfBEvTUARhqbwe53fxR6c71xKF/pRD8Cwa7sbV9Mw/fF4rrhtSmIne//hZEhsoLnkU0L/zTsOPBTuV0A8cQ=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 6ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getUserInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:53.249Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getUserInfo",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "IOCeDuhtbYNd7lMSH5sLH8LifqXSoSCd/LwO1pRo2sXO1JZCWR3q5dhkWlWFzjKQhm7en0rF+WNv5ILCU8JEiju1gh5axEk1lBeNrYl/IiV9yqA5NRIhWdMJWMK4PoDbqDVez6s8FhSoSPedGG49WG35QcxOwHNFUFatzH9353KxVArFaFQBI2i0HkBT6Fqse9WfVQh4VqQjIq1Wdjl+Yfl/blr5ipNdpfmKWcwGcblSBxhEpzfDtENvBJ3pD9aoYXBe+EJuo1bEyb1qPrgoIph2eqA0nEtooYp3b4ETwStYbJseBc4j7y/yPEXfH5fdpn7sPQV8T1GNnA8d+ltSTg=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getUserInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 7ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 POST /api/auth/validate-session 200 in 21ms
 GET /api/communities 200 in 22ms
 OPTIONS /api/user 200 in 2ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getContextData',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:54.799Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getContextData",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "olOiIUysEVU70tEJpH0/RI00mWL6koSBbNB2tKSI8HbG/EmWOe25VbumySOWlgzEcHlPJUXTV9cGQBWRrzOZwjZacvisyx+DfDoC/IwSCShMHt4u6SuZOJkebgI7rrK/R0cSO/ALOWEiYSHdZ4Mi/jAjXmUYWemi9VYqvXhcgeYrKWkWzCaReshFC6aJywNaHmcjJdlefye5HPKA6tp2VDlU6W7hS9OFM1lry9JbqX1qQ4ul3Gjhs54bc8OiEnWI6JS2ol5O9eZ44tYrXTaQrqhc1Vhe32AGbawXkv6Cr8DxkYtGA/CrUbO3ocYYO7dVAcbADR8t87JTlWEk7/Pm5Q=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getContextData',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 3ms
 OPTIONS /api/user 200 in 5ms
[PluginHost] 🔐 Validating signature for request: {
  method: 'getUserInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:54.824Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getUserInfo",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "N4bJowW97J18QjbUOYEp1MV7TjVD/1hp0+ah+cZN+MsG1Zwi/u3cSEmjYSru3zdPh6sZoB7BkCmuDogg8vOCmiU2Ynw959ytab1V8fT9N5BpOaxM1EAv5GEnUUoEF+GRy1PbRvB4q3pUID7urw8myONpXQO3n+SUWAF+S7poYojmXaGI4RX2pCto+XRKwg/fR230i11Hh0KlsRrzrkqL9HIk0smgZgSmoDsL6Fdc0k7IGUCY2vRvjgaEt/yO4pjT2AW8ND7n3KwG2uZbHeeIJsg8mvIIWSIvlzrcKclQg/qb6091gyZwL+6S8QsBbE9EXfBmFTRzm/bb7w5P/hTlag=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[User API] Request processed: {
  method: 'getUserInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F',
  success: false
}
 POST /api/user 400 in 3ms
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
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
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 6ms
 OPTIONS /api/communities 200 in 2ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 7ms
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
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
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 9ms
 OPTIONS /api/communities 200 in 3ms
 OPTIONS /api/community 200 in 3ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
[PluginHost] 🔐 Validating signature for request: {
  method: 'getCommunityInfo',
  hasSignature: true,
  requestId: 'no-id',
  timestamp: '2025-07-25T12:40:55.914Z'
}
[VALIDATE DEBUG] Full request data being validated: {
  "method": "getCommunityInfo",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "signature": "d97yN5WLx94HOMNfJeMB44GsJUE9sZVD6fY5xIfXwgZbWG5yMiV8ezEvqqTlVIMByO2UHe0rUldROWU/EDKwFtWMIHX35g4eNEqWN6KhZYtUhLdKEpxRxLbaU/zA+1/NWjFOZUW/sPOwnWxoD+k4kISLCUXBqaRSjf2snQuxPvNAbV1zTXXWQbE8VlCFrzFLyANsw/51S8JTLdQs5zavClw9fJo+wfrSCYV3etEOp3hqeDm1stfe0UuEg27clHTzZEwvSmYj0nLLb2aEn5SN2OCgYlSGIUVYz9W5+wt+ksbn3zhLhILKmBzasHYRs+1IMSWjNUxBIkJau6B7oPhRYQ=="
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
[CgPluginLibHost] Public key PEM starts with: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQE
[CgPluginLibHost] Attempting ECDSA P-256 import...
[CgPluginLibHost] ECDSA P-256 import failed, trying RSA...
[CgPluginLibHost] Attempting RSA-2048 import...
[CgPluginLibHost] RSA-2048 import successful
[CgPluginLibHost] Keys imported successfully using RSA-2048 algorithm
[CgPluginLibHost] Initialized with key pair
 GET /api/communities 200 in 10ms
[PluginHost] 🔐 Signature verification result: false
[PluginHost] ❌ Request rejected: Invalid signature
[Community API] Request processed: {
  method: 'getCommunityInfo',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  params: undefined,
  success: false
}
 POST /api/community 400 in 5ms
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
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
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 3ms
 OPTIONS /api/communities 200 in 2ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 7ms
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
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
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 6ms
 OPTIONS /api/communities 200 in 2ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 8ms
[Host Sign API] Signing request: {
  method: 'getUserCommunities',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F'
}
[SIGN DEBUG] Full request data being signed: {
  "method": "getUserCommunities",
  "userId": "up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F",
  "communityId": "1e5fb703-1805-42e7-927e-be3f7855856c",
  "params": {
    "sessionToken": "b54601f55595ff340835f7817f40daf50ad63e75cd80069dba46a08de5c3f796"
  }
}
[CgPluginLibHost] Starting key import process...
[CgPluginLibHost] Private key length: 1700
[CgPluginLibHost] Public key length: 451
[CgPluginLibHost] Private key starts with: -----BEGIN PRIVATE KEY-----
MI
[CgPluginLibHost] Public key starts with: -----BEGIN PUBLIC KEY-----
MII
[CgPluginLibHost] Converted to PEM format successfully
[CgPluginLibHost] Private key PEM starts with: -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w
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
[Host Sign API] ✅ Request signed successfully
 POST /api/sign 200 in 6ms
 OPTIONS /api/communities 200 in 3ms
[communities] Authenticated request for user: up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/communities 200 in 9ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 25ms
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
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 28ms
[GET /api/auth/sessions] Retrieved 1 sessions for user up:0x17F988E8BA140A442f6143Fbc40e79103D16C00F
 GET /api/auth/sessions 200 in 16ms
