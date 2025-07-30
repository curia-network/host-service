web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xb0b11ba5d51c99bd30850a7b551f5893ca218f4f","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":285},"id":326,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x69cf660b4dca16197bee3e050e9cedcc82539793: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x69cf660b4dca16197bee3e050e9cedcc82539793\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":286},\"id\":327,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x69cf660b4dca16197bee3e050e9cedcc82539793","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":286},"id":327,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0xf269a00d8cf862ddb881256d5f3292b4d91ff691: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0xf269a00d8cf862ddb881256d5f3292b4d91ff691\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":287},\"id\":328,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xf269a00d8cf862ddb881256d5f3292b4d91ff691","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":287},"id":328,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x8767341ae0ef5c83a5ac17f7d9777808a4bcd545: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x8767341ae0ef5c83a5ac17f7d9777808a4bcd545\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":288},\"id\":329,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x8767341ae0ef5c83a5ac17f7d9777808a4bcd545","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":288},"id":329,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x1f0ab6d08e5d2fc3140b54f245ad10296970fab9: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x1f0ab6d08e5d2fc3140b54f245ad10296970fab9\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":289},\"id\":330,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x1f0ab6d08e5d2fc3140b54f245ad10296970fab9","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":289},"id":330,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0xbdc350d7d2cc68a1b18708e9c4212d5bf58bd249: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0xbdc350d7d2cc68a1b18708e9c4212d5bf58bd249\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":290},\"id\":331,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xbdc350d7d2cc68a1b18708e9c4212d5bf58bd249","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":290},"id":331,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x8b22d938774fcbee58ebe7046457e6020be71f75
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x29ae9efc46fc0ebfdf8ae5ffb01cad06101ccb3f
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x9c06ab27224eaa852999704366afd2d58a8f78b4
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x78dce6213ec88fdd89d8313811ac744ea11caf9a
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x8356694ca32c05ca7494438b08cb9b8aa691230c
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0xc688e416c646845334b6426ebc967fde7ba4cba6
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0xf8d516a58daccebc9102712d1c858ad40e987586
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x6bf77443930fb06b23c798c2f351b1a59c0afaf5
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x08cbacf01db363d55246180f764cd33c6515833e
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] ⚠️ Profile resolution failed for 0x8b22d938774fcbee58ebe7046457e6020be71f75: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x8b22d938774fcbee58ebe7046457e6020be71f75\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":291},\"id\":332,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x8b22d938774fcbee58ebe7046457e6020be71f75","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":291},"id":332,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x29ae9efc46fc0ebfdf8ae5ffb01cad06101ccb3f: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x29ae9efc46fc0ebfdf8ae5ffb01cad06101ccb3f\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":292},\"id\":333,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x29ae9efc46fc0ebfdf8ae5ffb01cad06101ccb3f","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":292},"id":333,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x9c06ab27224eaa852999704366afd2d58a8f78b4: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x9c06ab27224eaa852999704366afd2d58a8f78b4\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":293},\"id\":334,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x9c06ab27224eaa852999704366afd2d58a8f78b4","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":293},"id":334,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":294},\"id\":335,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":294},"id":335,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x78dce6213ec88fdd89d8313811ac744ea11caf9a: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x78dce6213ec88fdd89d8313811ac744ea11caf9a\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":295},\"id\":336,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x78dce6213ec88fdd89d8313811ac744ea11caf9a","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":295},"id":336,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x8356694ca32c05ca7494438b08cb9b8aa691230c: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x8356694ca32c05ca7494438b08cb9b8aa691230c\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":296},\"id\":337,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x8356694ca32c05ca7494438b08cb9b8aa691230c","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":296},"id":337,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0xc688e416c646845334b6426ebc967fde7ba4cba6: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0xc688e416c646845334b6426ebc967fde7ba4cba6\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":297},\"id\":338,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xc688e416c646845334b6426ebc967fde7ba4cba6","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":297},"id":338,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0xf8d516a58daccebc9102712d1c858ad40e987586: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0xf8d516a58daccebc9102712d1c858ad40e987586\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":298},\"id\":339,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xf8d516a58daccebc9102712d1c858ad40e987586","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":298},"id":339,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x6bf77443930fb06b23c798c2f351b1a59c0afaf5: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x6bf77443930fb06b23c798c2f351b1a59c0afaf5\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":299},\"id\":340,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x6bf77443930fb06b23c798c2f351b1a59c0afaf5","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":299},"id":340,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ⚠️ Profile resolution failed for 0x08cbacf01db363d55246180f764cd33c6515833e: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x08cbacf01db363d55246180f764cd33c6515833e\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":300},\"id\":341,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x08cbacf01db363d55246180f764cd33c6515833e","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":300},"id":341,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
 POST /api/user 200 in 16648ms
 POST /api/user 200 in 5646ms
[UpFriendsService] 🔍 Resolving LSP3 profile for 0x784aac2629f2c26ae3e17d43c8e0d7284c9a2d73
[Deprecation notice] The schema with keyName: LSP3Profile uses deprecated valueContent: JSONURL. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.
[UpFriendsService] ⚠️ Profile resolution failed for 0x784aac2629f2c26ae3e17d43c8e0d7284c9a2d73: Error: missing response (requestBody="{\"method\":{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"0x784aac2629f2c26ae3e17d43c8e0d7284c9a2d73\",\"value\":\"0x0\",\"gas\":\"0xf4240\",\"data\":\"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000\"},\"latest\"],\"id\":301},\"id\":342,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={}, url="https://rpc.mainnet.lukso.network", code=SERVER_ERROR, version=web/5.8.0)
    at Generator.throw (<anonymous>) {
  reason: 'missing response',
  code: 'SERVER_ERROR',
  requestBody: '{"method":{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x784aac2629f2c26ae3e17d43c8e0d7284c9a2d73","value":"0x0","gas":"0xf4240","data":"0x01ffc9a7629aa69400000000000000000000000000000000000000000000000000000000"},"latest"],"id":301},"id":342,"jsonrpc":"2.0"}',
  requestMethod: 'POST',
  serverError: TypeError: Referrer "client" is not a valid URL.
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at Generator.next (<anonymous>)
      at new Promise (<anonymous>)
      at new Promise (<anonymous>)
      at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
      at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
      at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
      at Array.map (<anonymous>)
      at map (src/lib/friends/UpFriendsService.ts:491:34)
      at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      at async UpFriendsService.fetchWithCache (src/lib/friends/UpFriendsService.ts:91:22)
    568 |
    569 |       // Fetch LSP3Profile data
  > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
        |                                       ^
    571 |       
    572 |       if (profileData && profileData.value) {
    573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
    [cause]: TypeError: Invalid URL
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at Generator.next (<anonymous>)
        at new Promise (<anonymous>)
        at new Promise (<anonymous>)
        at fetchData (src/lib/friends/UpFriendsService.ts:570:39)
        at resolveUPProfile (src/lib/friends/UpFriendsService.ts:518:35)
        at convertAddressToFriendInfo (src/lib/friends/UpFriendsService.ts:491:54)
        at Array.map (<anonymous>)
        at map (src/lib/friends/UpFriendsService.ts:491:34)
        at async UpFriendsService.fetchUserFollowing (src/lib/friends/UpFriendsService.ts:129:13)
      568 |
      569 |       // Fetch LSP3Profile data
    > 570 |       const profileData = await erc725.fetchData('LSP3Profile');
          |                                       ^
      571 |       
      572 |       if (profileData && profileData.value) {
      573 |         const metadata = profileData.value as LSP3ProfileMetadata; {
      code: 'ERR_INVALID_URL',
      input: 'client'
    }
  },
  url: 'https://rpc.mainnet.lukso.network'
}
[UpFriendsService] ✅ Successfully converted 301/301 addresses
[UpFriendsService] ✅ Successfully fetched 301 friends for 0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92
[DatabaseDataProvider] ✅ Fetched 301 UP friends for up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92, returning 100 (page 1)
[User API] Request processed: {
  method: 'getUserFriends',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92',
  success: true
}
[UpFriendsService] ✅ Successfully converted 301/301 addresses
[UpFriendsService] ✅ Successfully fetched 301 friends for 0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92
[DatabaseDataProvider] ✅ Fetched 301 UP friends for up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92, returning 100 (page 1)
[User API] Request processed: {
  method: 'getUserFriends',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92',
  success: true
}
[UpFriendsService] ✅ Successfully converted 301/301 addresses
[UpFriendsService] ✅ Successfully fetched 301 friends for 0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92
[DatabaseDataProvider] ✅ Fetched 301 UP friends for up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92, returning 100 (page 1)
[User API] Request processed: {
  method: 'getUserFriends',
  communityId: '1e5fb703-1805-42e7-927e-be3f7855856c',
  userId: 'up:0x0a607f902CAa16a27AA3Aabd968892aa89ABDa92',
  suc