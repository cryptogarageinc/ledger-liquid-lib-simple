# ledger-liquid-lib-simple

## Usage

   1. calculate auth signature: `npm run authsig -- -a <authPrivkey> -t <txHex>`

   2. sign: `npm run sign -- -s <authSignature> [-n <nettype>] -t <txHex> -i <txid> -v <vout> -c <amountCommitment> -p <bip32Path> [-d <descriptor>] [-a <address> [-r <redeemScript>]]`

   3. example: npm run example

   4. dump pubkey: `npm run pubkey -- [-r] -path <bip32 path>`
     - ex:mainnet) npm run pubkey -- -path m/44h/0h/0h
     - ex:testnet) npm run pubkey -- -r -path m/44h/0h/0h

   - set authrization pubkey: `npm run setauthkey -- -apk <authrization pubkey(uncompressed)>`
     - ex) npm run setauthkey -- -apk 04b85b0e5f5b41f1a95bbf9a83edd95c741223c6d9dc5fe607de18f015684ff56ec359705fcf9bbeb1620fb458e15e3d99f23c6f5df5e91e016686371a65b16f0c
