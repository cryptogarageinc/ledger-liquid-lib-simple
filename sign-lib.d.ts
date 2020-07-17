import {Cfdjs} from 'cfd-js-wasm';
import * as ledgerLib from './src/ledger-liquid-lib.d';

export interface SignUtxoData extends ledgerLib.WalletUtxoData {
  descriptor?: string; // output descriptor
  address?: string; // address
}

export interface SignatureData {
  utxoData: SignUtxoData;
  signature: string;
}

export interface SignResponse {
  signatureList: SignatureData[];
  hasAddedSignatureToTxHex: boolean[];
  txHex: string;
}

export interface ConvertUtxoResponse {
  utxoData: ledgerLib.WalletUtxoData;
  hasAddedSignatureToTxHex: boolean;
  hashType: string;
}

/**
 * Sign utility for ledger.
 */
export class LedgerSignUtil {
  /**
   * @constructor
   * @param cfdjsObject cfd-js-wasm object.
   */
  constructor(cfdjsObject: Cfdjs);

  /**
   * Sign transaction using ledger.
   *
   * @param liquidLib              ledger liquid library.
   * @param txHex                  transaction hex.
   * @param authorizationSignature application check flag.
   * @param walletUtxoList         sign target utxo list.
   * @returns SignResponse wrapped promise.
   * @throws Error                 error object
   */
  sign(
    liquidLib: ledgerLib.LedgerLiquidWrapper,
    txHex: string,
    authorizationSignature: string,
    walletUtxoList: SignUtxoData[], // sign target utxo list.
  ): Promise<SignResponse>;

  /**
   * Convert utxo data.
   *
   * @param network                network type.
   * @param utxoData               sign utxo data.
   * @param getPubkeyFunc          get pubkey function.
   * @returns ConvertUtxoResponse wrapped promise.
   * @throws Error                 error object
   */
  convertUtxoData(
    network: ledgerLib.NetworkType,
    utxoData: SignUtxoData,
    getPubkeyFunc: (bip32Path: string) => Promise<string>,
  ): Promise<ConvertUtxoResponse>;
}
