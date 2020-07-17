/* eslint-disable require-jsdoc */
const liquidLib = require('./src/ledger-liquid-lib');

const ledgerSignUtil = class LedgerSignUtil {
  constructor(cfdjsObject) {
    this.cfdjsObject = cfdjsObject;
    if (!cfdjsObject) {
      throw new Error('cfdjsObject is empty.');
    }
  }

  async convertUtxoData(network, utxoInfo, getPubkeyFunc) {
    const redeemScript = utxoInfo.redeemScript || '';
    let pubkey = utxoInfo.pubkey || '';
    const descriptor = utxoInfo.descriptor || '';
    let address = utxoInfo.address || '';
    let hashType;
    let canAppendSignature = false;
    let script = redeemScript;

    if (address) {
      try {
        const parseAddr = await this.cfdjsObject.GetUnblindedAddress({
          confidentialAddress: address,
        });
        address = parseAddr.unblindedAddress;
      } catch (e) {
        // do nothing
      }
    }

    if (descriptor) {
      const desc = await this.cfdjsObject.ParseDescriptor({
        descriptor, network, isElements: true,
      });
      if (!desc.hashType) {
        throw new Error('unsupported output descriptor.');
      }
      hashType = desc.hashType;
      if (desc.hashType.indexOf('pkh') > 0) {
        if (desc.scripts) {
          let tempKey;
          if (desc.scripts.length > 1) {
            tempKey = desc.scripts[1].key;
          } else {
            tempKey = desc.scripts[0].key;
          }
          if (tempKey && tempKey.length > 0) pubkey = tempKey;
        }
        if (!pubkey) throw new Error('invalid output descriptor.');
        script = '';
        canAppendSignature = true;
      } else {
        if (hashType == 'p2sh') throw new Error('p2sh is not support.');
        script = '';
        if (desc.scripts) {
          const tempData = desc.scripts[desc.scripts.length - 1];
          const tempScript = tempData.redeemScript;
          if (tempScript && tempScript.length > 0) {
            script = tempScript;
          }
        }
        if (!script) throw new Error('redeemScript is empty.');
      }
    } else {
      if (!address) throw new Error('address is empty.');
      const addrInfo = await this.cfdjsObject.GetAddressInfo({
        address,
        isElements: true,
      });
      hashType = addrInfo.hashType;
      network = addrInfo.network;
      if (hashType == 'p2sh') {
        if (!script) {
          hashType = 'p2sh-p2wpkh';
          canAppendSignature = true;
        } else {
          hashType = 'p2sh-p2wsh';
        }
      } else if (hashType.indexOf('pkh') <= 0) {
        if (!script) throw new Error('redeemScript is empty.');
      } else {
        script = '';
        canAppendSignature = true;
      }
    }
    if (hashType == 'p2pkh') throw new Error('p2pkh is not support.');

    const ledgerPubkey = await getPubkeyFunc(utxoInfo.bip32Path);
    if (!pubkey) {
      pubkey = ledgerPubkey;
    } else if (pubkey != ledgerPubkey) {
      throw new Error('pubkey not equals.');
    }

    if (script) {
      const scriptRet = await this.cfdjsObject.ParseScript({script});
      let isFind = false;
      const scripts = scriptRet.scriptItems;
      const scriptLen = scripts.length;
      for (const scriptItem of scripts) {
        if (scriptItem == pubkey) {
          isFind = true;
          if ((scripts.length >= 4) && (scripts[0] == 'OP_1') &&
              (scripts[scriptLen - 1] == 'OP_CHECKMULTISIG')) {
            canAppendSignature = true;
          }
        }
      }
      if (!isFind) throw new Error('pubkey is not found into redeemScript');
    }
    if (address) {
      const key = (!script) ? pubkey : script;
      const type = (!script) ? 'pubkey' : 'redeem_script';
      const addrRet = await this.cfdjsObject.CreateAddress({
        network, hashType,
        isElements: true,
        keyData: {type, hex: key},
      });
      if (address != addrRet.address) throw new Error('address not equals.');
    }

    const utxoData = {
      bip32Path: utxoInfo.bip32Path,
      txid: utxoInfo.txid,
      vout: utxoInfo.vout,
      amount: utxoInfo.amount,
      valueCommitment: utxoInfo.valueCommitment,
      redeemScript: script,
      pubkey,
    };
    return {
      utxoData, hashType,
      hasAddedSignatureToTxHex: canAppendSignature,
    };
  }

  async sign(ledgerLib, txHex, authorizationSignature, walletUtxoList) {
    if (!txHex) throw new Error('transaction hex is empty.');
    if (!authorizationSignature) throw new Error('authorizationSignature is empty.');
    const utxoList = [];
    const hasAddedSignatureToTxHex = [];
    const hashTypeList = [];
    const curApp = ledgerLib.getCurrentApplication();
    let network = liquidLib.NetworkType.Regtest;
    if (liquidLib.ApplicationType.LiquidHeadless == curApp) {
      network = liquidLib.NetworkType.LiquidV1;
    }

    const getPubkeyFunc = async function(bip32Path) {
      const ledgerPubkey = await ledgerLib.getWalletPublicKey(bip32Path);
      if (!ledgerPubkey.success) {
        throw new Error(`getSignature ecode=${ledgerPubkey.errorCodeHex} msg=${ledgerPubkey.errorMessage}`);
      }
      return ledgerPubkey.publicKey;
    };

    for (const utxoInfo of walletUtxoList) {
      const resp = await this.convertUtxoData(network, utxoInfo, getPubkeyFunc);
      utxoList.push(resp.utxoData);
      hasAddedSignatureToTxHex.push(resp.hasAddedSignatureToTxHex);
      hashTypeList.push(resp.hashType);
    }
    const result = await ledgerLib.getSignature(txHex,
        utxoList, authorizationSignature);
    if (!result.success) {
      throw new Error(`getSignature ecode=${result.errorCodeHex} msg=${result.errorMessage}`);
    }

    const signatureList = [];
    let hex = txHex;
    for (let index = 0; index < result.signatureList.length; ++index) {
      const signature = result.signatureList[index].signature;
      const pubkey = result.signatureList[index].utxoData.pubkey;
      const script = result.signatureList[index].utxoData.redeemScript;
      const txid = result.signatureList[index].utxoData.txid;
      const vout = result.signatureList[index].utxoData.vout;
      signatureList.push({
        utxoData: walletUtxoList[index],
        signature,
      });
      if (hasAddedSignatureToTxHex[index]) {
        if (!script) {
          const signRet = await this.cfdjsObject.AddPubkeyHashSign({
            tx: hex,
            isElements: true,
            txin: {
              txid, vout, pubkey,
              hashType: hashTypeList[index],
              signParam: {hex: signature},
            },
          });
          hex = signRet.hex;
        } else {
          const signRet = await this.cfdjsObject.AddMultisigSign({
            tx: hex,
            isElements: true,
            txin: {
              txid, vout,
              hashType: hashTypeList[index],
              signParams: [{hex: signature, relatedPubkey: pubkey}],
              witnessScript: script,
            },
          });
          hex = signRet.hex;
        }
      }
    }
    return {
      signatureList,
      hasAddedSignatureToTxHex,
      txHex: hex,
    };
  }
};

module.exports = ledgerSignUtil;
module.exports.LedgerSignUtil = ledgerSignUtil;
