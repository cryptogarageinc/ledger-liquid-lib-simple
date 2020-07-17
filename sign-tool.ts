/* eslint-disable require-jsdoc */
import {
  LedgerLiquidWrapper, NetworkType, GetSignatureState, ProgressInfo,
} from './src/ledger-liquid-lib';
import {LedgerSignUtil} from './sign-lib';
import * as cfdjs from 'cfd-js-wasm';
import {
  CommandLineParser, CommandLineAction, CommandLineChoiceParameter,
  CommandLineIntegerParameter, CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import {exit} from 'process';
import {readFileSync} from 'fs';

let cfdjsObj: cfdjs.Cfdjs;
let isDumpSignature = false;
let lastState = '';
let pastAccessTime = 0;
const dumpSignatureProgress = async function(
    lib: LedgerLiquidWrapper): Promise<void> {
  const result = lib.getSignatureState();
  const cur = new Date();
  const hour = (cur.getHours() > 9) ? cur.getHours() : ('0' + cur.getHours());
  const min = (cur.getMinutes() > 9) ? cur.getMinutes() : ('0' + cur.getMinutes());
  const sec = (cur.getSeconds() > 9) ? cur.getSeconds() : ('0' + cur.getSeconds());
  const msec = (cur.getMilliseconds() > 99) ? cur.getMilliseconds() :
      (cur.getMilliseconds() > 9) ? ('0' + cur.getMilliseconds()) :
          ('00' + cur.getMilliseconds());
  const timeStr = `[${hour}:${min}:${sec}.${msec}]`;
  if (result.success) {
    let prog: ProgressInfo = {current: 0, total: 0};
    switch (result.currentState) {
      case GetSignatureState.AnalyzeUtxo:
        prog = result.analyzeUtxo;
        break;
      case GetSignatureState.InputTx:
        prog = result.inputTx;
        break;
      case GetSignatureState.GetSignature:
        prog = result.getSignature;
        break;
      default:
        break;
    }
    if (result.errorMessage === 'not execute.') {
      if (lastState !== result.errorMessage) {
        // console.log(`${timeStr} getSignatureState:`, result);
        lastState = result.errorMessage;
      }
    } else {
      const state = `${result.currentState}: ${prog.current}/${prog.total}`;
      if (lastState !== state) {
        console.log(`${timeStr} getSignatureState(${state})`);
      } else if (pastAccessTime !== result.lastAccessTime) {
        console.log(`${timeStr} getSignatureState(${state}): time[${result.lastAccessTime}]`);
      }
      lastState = state;
      pastAccessTime = result.lastAccessTime;
    }
  } else if (!isDumpSignature) {
    // console.log(`${timeStr} getSignatureState:`, result);
  } else if (lastState !== result.errorMessage) {
    if (result.errorMessage != 'not execute.') {
      console.log(`${timeStr} getSignatureState:`, result);
    }
    lastState = result.errorMessage;
  }
  if (isDumpSignature) {
    setTimeout(async () => {
      await dumpSignatureProgress(lib);
    }, 500);
  }
};

const signFunction = async function(
    authSig: string,
    network: string,
    proposalTx: string,
    txid: string,
    vout: number,
    commitment: string,
    path: string,
    address: string,
    redeemScript: string,
    descriptor: string,
): Promise<void> {
  if (!proposalTx) {
    throw new Error('Invalid tx hex.');
  }
  const networkType = (network == 'liquidv1') ?
      NetworkType.LiquidV1 : NetworkType.Regtest;
  const walletUtxoList = [];
  walletUtxoList.push({
    txid, vout, redeemScript, address, descriptor,
    bip32Path: path,
    valueCommitment: commitment,
    pubkey: '',
  });

  const ledgerLib = new LedgerLiquidWrapper(networkType, true);
  try {
    const connRet = await ledgerLib.connect(0, undefined);
    if (!connRet.success) {
      throw new Error(`connect ecode=${connRet.errorCodeHex} msg=${connRet.errorMessage}`);
    }
    isDumpSignature = true;
    setTimeout(async () => {
      await dumpSignatureProgress(ledgerLib);
    }, 1000);

    const signUtil = new LedgerSignUtil(cfdjsObj);
    const result = await signUtil.sign(
        ledgerLib, proposalTx, authSig, walletUtxoList);
    isDumpSignature = false;
    setTimeout(async () => {}, 1000);
    console.log('---------- result ----------');
    console.log('signature:', result.signatureList[0].signature);
    if (result.hasAddedSignatureToTxHex[0]) {
      console.log('signed tx hex:', result.txHex);
    }
  } catch (e) {
    throw e;
  } finally {
    isDumpSignature = false;
    await ledgerLib.disconnect();
  }
};

class SignAction extends CommandLineAction {
  private _authSig!: CommandLineStringParameter;
  private _network!: CommandLineChoiceParameter;
  private _tx!: CommandLineStringParameter;
  private _txFile!: CommandLineStringParameter;
  private _txid!: CommandLineStringParameter;
  private _vout!: CommandLineIntegerParameter;
  private _commitment!: CommandLineStringParameter;
  private _path!: CommandLineStringParameter;
  private _address!: CommandLineStringParameter;
  private _redeemScript!: CommandLineStringParameter;
  private _descriptor!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'sign',
      summary: 'Sign transaction with ledger.',
      documentation: 'Sign transaction with ledger.',
    });
  }

  protected onDefineParameters(): void { // abstract
    this._authSig = this.defineStringParameter({
      parameterLongName: '--authsig',
      parameterShortName: '-s',
      description: 'Authorization Signature',
      required: true,
      argumentName: 'AUTHSIG',
    });
    this._network = this.defineChoiceParameter({
      parameterLongName: '--network',
      parameterShortName: '-n',
      description: 'network type',
      alternatives: ['liquidv1', 'regtest'],
      defaultValue: 'liquidv1',
    });
    this._tx = this.defineStringParameter({
      parameterLongName: '--tx',
      parameterShortName: '-t',
      description: 'Transaction Hex',
      argumentName: 'TX',
    });
    this._txFile = this.defineStringParameter({
      parameterLongName: '--txfile',
      parameterShortName: '-f',
      description: 'Transaction Hex File.',
      argumentName: 'FILE',
    });
    this._txid = this.defineStringParameter({
      parameterLongName: '--txid',
      parameterShortName: '-i',
      description: 'UTXO TransactionID',
      required: true,
      argumentName: 'TXID',
    });
    this._vout = this.defineIntegerParameter({
      parameterLongName: '--vout',
      parameterShortName: '-v',
      description: 'UTXO Transaction vout',
      required: true,
      argumentName: 'VOUT',
    });
    this._commitment = this.defineStringParameter({
      parameterLongName: '--commitment',
      parameterShortName: '-c',
      description: 'Amount Commitment',
      required: true,
      argumentName: 'COMMITMENT',
    });
    this._path = this.defineStringParameter({
      parameterLongName: '--path',
      parameterShortName: '-p',
      description: 'Bip32 path',
      required: true,
      argumentName: 'PATH',
    });
    this._address = this.defineStringParameter({
      parameterLongName: '--address',
      parameterShortName: '-a',
      description: 'UTXO address',
      required: false,
      argumentName: 'ADDRESS',
    });
    this._redeemScript = this.defineStringParameter({
      parameterLongName: '--redeem-script',
      parameterShortName: '-r',
      description: 'UTXO redeem script for p2wsh/p2sh',
      required: false,
      argumentName: 'REDEEMSCRIPT',
    });
    this._descriptor = this.defineStringParameter({
      parameterLongName: '--descriptor',
      parameterShortName: '-d',
      description: 'UTXO output descriptor',
      required: false,
      argumentName: 'DESCRIPTOR',
    });
  }

  protected onExecute(): Promise<void> { // abstract
    let tx = '';
    if (this._txFile.value) {
      tx = readFileSync(this._txFile.value, 'utf-8').toString().trim();
    } else if (!this._tx.value) {
      throw new Error('tx is empty.');
    } else {
      tx = this._tx.value;
    }
    return signFunction(
        this._authSig.value || '',
        this._network.value || '',
        tx || '',
        this._txid.value || '',
        this._vout.value || 0,
        this._commitment.value || '',
        this._path.value || '',
        this._address.value || '',
        this._redeemScript.value || '',
        this._descriptor.value || '',
    );
  }
}

class GetAuthSigAction extends CommandLineAction {
  private _privkey!: CommandLineStringParameter;
  private _tx!: CommandLineStringParameter;
  private _txFile!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'getauthsig',
      summary: 'Get authorization signature.',
      documentation: 'Get authorization signature from tx hex.',
    });
  }

  protected onDefineParameters(): void { // abstract
    this._privkey = this.defineStringParameter({
      parameterLongName: '--privkey',
      parameterShortName: '-p',
      description: 'Authorization Privkey Hex.',
      required: true,
      argumentName: 'PRIVKEY',
    });

    this._tx = this.defineStringParameter({
      parameterLongName: '--tx',
      parameterShortName: '-t',
      description: 'Transaction Hex.',
      argumentName: 'TX',
    });

    this._txFile = this.defineStringParameter({
      parameterLongName: '--txfile',
      parameterShortName: '-f',
      description: 'Transaction Hex File.',
      argumentName: 'FILE',
    });
  }

  protected async onExecute(): Promise<void> { // abstract
    if (!this._privkey.value) {
      throw new Error('privkey is empty.');
    }
    let tx = '';
    if (this._txFile.value) {
      tx = readFileSync(this._txFile.value, 'utf-8').toString().trim();
    } else if (!this._tx.value) {
      throw new Error('tx is empty.');
    } else {
      tx = this._tx.value;
    }
    const authorizationHash = await cfdjsObj.SerializeLedgerFormat({
      isAuthorization: true,
      tx,
    });

    const authSig = await cfdjsObj.CalculateEcSignature({
      sighash: authorizationHash.sha256,
      privkeyData: {
        privkey: this._privkey.value,
        wif: false,
      },
      isGrindR: false,
    });
    const authDerSigData = await cfdjsObj.EncodeSignatureByDer({
      signature: authSig.signature,
      sighashType: 'all'});
    const authDerSig = authDerSigData.signature.substring(
        0, authDerSigData.signature.length - 2);
    console.log(`authorizationSignature: ${authDerSig}`);
    return;
  }
}

class SignCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: 'sign-tool',
      toolDescription: 'The ledger liquid lib\'s sign tool.',
    });
    this.addAction(new SignAction());
    this.addAction(new GetAuthSigAction());
  }

  protected onDefineParameters(): void {
    // abstract
  }

  protected onExecute(): Promise<void> {
    // override
    return super.onExecute();
  }
}

const main = async function() {
  cfdjsObj = cfdjs.getCfd();
  process.on('unhandledRejection', console.dir);

  try {
    const commandLine: SignCommandLine = new SignCommandLine();
    commandLine.execute();
  } catch (e) {
    console.log(e);
    exit(1);
  }
};
cfdjs.addInitializedListener(main);
