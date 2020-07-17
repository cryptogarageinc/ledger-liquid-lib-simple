import * as cfdjs from 'cfd-js-wasm';
import { exit } from 'process';
import {LedgerSignUtil, SignUtxoData} from '../sign-lib';
import {NetworkType} from '../src/ledger-liquid-lib';

let signUtil: LedgerSignUtil;

const testFuncList: (() => Promise<void>)[] = [];

// main
cfdjs.addInitializedListener(async () => {
  signUtil = new LedgerSignUtil(cfdjs.getCfd());
  let count = 0;
  try {
    for (const func of testFuncList) {
      await func();
      ++count;
    }
  } catch (e) {
    console.log(e);
  }
  if (count == testFuncList.length) {
    console.log('test all success.');
    exit(0);
  } else {
    console.log('test fail.');
    exit(1);
  }
});

// p2wpkh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `wpkh(${pubkey})`,
    pubkey,
    address: 'ert1qcajkgjptcg8xmknpc2actvlkqxr0xlfecylcj3',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2sh-p2wpkh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `sh(wpkh(${pubkey}))`,
    pubkey,
    address: 'XJkzq4eqXVEoAA8SACKSBPCHfxtx6btMLX',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2sh-p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2wpkh, address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    address: 'ert1qcajkgjptcg8xmknpc2actvlkqxr0xlfecylcj3',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2sh-p2wpkh, address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    address: 'XJkzq4eqXVEoAA8SACKSBPCHfxtx6btMLX',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2sh-p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2wpkh, descriptor, ct address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `wpkh(${pubkey})`,
    pubkey,
    address: 'el1qqtrqglu5g8kh6mfsg4qxa9wq0nv9cauwfwxw70984wkqnw2uwz0wt3m9v3yzhsswdhdxrs4mskelvqvx7d7nj3nzsp05qthae',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2wpkh, ct address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    address: 'el1qqtrqglu5g8kh6mfsg4qxa9wq0nv9cauwfwxw70984wkqnw2uwz0wt3m9v3yzhsswdhdxrs4mskelvqvx7d7nj3nzsp05qthae',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wpkh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2wsh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.LiquidV1;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `wsh(multi(1,${pubkey}))`,
    pubkey,
    address: 'ex1qde652khrxpxx8as08tpkuwsy88xswqtm3qf7m4ykw63q4y92vuhqc3lzt8',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wsh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,5121021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d8251ae';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2sh-p2wsh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `sh(wsh(multi(2,02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5,${pubkey},02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9)))`,
    pubkey,
    address: 'XCsATdhpxreNPM5Hsr71HiDx7LmcUU4q64',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'false,p2sh-p2wsh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,522102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee521021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d822102f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f953ae';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2wsh, address
testFuncList.push(async function() {
  const network = NetworkType.LiquidV1;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    redeemScript: '5121021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d8251ae',
    address: 'ex1qde652khrxpxx8as08tpkuwsy88xswqtm3qf7m4ykw63q4y92vuhqc3lzt8',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'true,p2wsh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,5121021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d8251ae';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// p2sh-p2wsh, address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    redeemScript: '522102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee521021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d822102f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f953ae',
    address: 'XCsATdhpxreNPM5Hsr71HiDx7LmcUU4q64',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  const ret = await signUtil.convertUtxoData(network, utxoData, func);

  const result = `${ret.hasAddedSignatureToTxHex},${ret.hashType},${ret.utxoData.pubkey},${ret.utxoData.redeemScript}`;
  const expect = 'false,p2sh-p2wsh,021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82,522102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee521021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d822102f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f953ae';
  if (result != expect) {
    throw new Error(`unmatch result: ${result}`);
  }
});

// --------- error case --------

// Error: p2pkh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `pkh(${pubkey})`,
    pubkey,
    address: '2dsc4KWkY9JfYKhCFip5r4UrVJJkAFkb5MH',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  try {
    await signUtil.convertUtxoData(network, utxoData, func);
    throw new Error('convertUtxoData not error.');
  } catch (e) {
    const errMsg = e.toString();
    const expect = 'Error: p2pkh is not support.';
    if (errMsg != expect) {
      throw new Error(`unmatch error: ${errMsg}`);
    }
  }
});

// Error: p2pkh, address
testFuncList.push(async function() {
  const network = NetworkType.Regtest;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    address: '2dsc4KWkY9JfYKhCFip5r4UrVJJkAFkb5MH',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  try {
    await signUtil.convertUtxoData(network, utxoData, func);
    throw new Error('convertUtxoData not error.');
  } catch (e) {
    const errMsg = e.toString();
    const expect = 'Error: p2pkh is not support.';
    if (errMsg != expect) {
      throw new Error(`unmatch error: ${errMsg}`);
    }
  }
});

// Error: p2sh, descriptor
testFuncList.push(async function() {
  const network = NetworkType.LiquidV1;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    descriptor: `sh(multi(1,${pubkey}))`,
    pubkey,
    address: 'H1T4SQZW2mQEL7tNGJpSr9c4pu1iH8R7Up',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  try {
    await signUtil.convertUtxoData(network, utxoData, func);
    throw new Error('convertUtxoData not error.');
  } catch (e) {
    const errMsg = e.toString();
    const expect = 'Error: p2sh is not support.';
    if (errMsg != expect) {
      throw new Error(`unmatch error: ${errMsg}`);
    }
  }
});

// Error: p2sh, address
testFuncList.push(async function() {
  const network = NetworkType.LiquidV1;
  const pubkey = '021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d82';
  const utxoData: SignUtxoData = {
    bip32Path: '44h/0h/0h/0/0',
    txid: 'b65b249e3ff74cc5e97675c59f2b6d74525642652c9228716efa9689e95bcc54',
    vout: 0,
    valueCommitment: '0982fa3e72e46a902e7f022ff3c63339559b15bced82470660265f8998e614dedf',
    pubkey,
    redeemScript: '5121021a8cffee67e4a5d8e9cfe0e6dbcc86484b425e93508522224c32bbba96fb6d8251ae',
    address: 'H1T4SQZW2mQEL7tNGJpSr9c4pu1iH8R7Up',
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const func = async function(_path: string) {
    return pubkey;
  };
  try {
    await signUtil.convertUtxoData(network, utxoData, func);
    throw new Error('convertUtxoData not error.');
  } catch (e) {
    const errMsg = e.toString();
    // for p2sh check
    const expect = 'Error: address not equals.';
    if (errMsg != expect) {
      throw new Error(`unmatch error: ${errMsg}`);
    }
  }
});
