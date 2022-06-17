/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */

export interface CreateInvoiceReq {
  expiresAt: Date,
  amount: number | string,
  token: TokenType,
  metadata?: string | Record<string, any>,
}

export interface CreatePushAddressReq {
  customerId: string,
  token: TokenType,
}

export type TokenType =
  // binance
  'bBUSD'
  | 'bUSDT'
  | 'btMNXe'
  | 'btBUSD'
  // polygon
  | 'pUSDC'
  | 'pUSDT'
  | 'pmUSDC'
  | 'pmUSDT'
  ;

export interface SignReqProps {
  publicKey: string,
  secretKey: string,
  timeout?: number,
  host?: string,
}



export interface CreateInvoiceResp {
  invoice: InvoiceData,
}

export interface CreatePushAddressResp {
  address: string,
  token: string,
}


export interface InvoiceData {
  id: string,
  companyId: number,
  paymentAddress: string,
  amount: string,
  status: InvoiceStatus,
  createdAt: Date,
  expiresAt: Date,
  paidAt?: Date | null,
  paidAmount?: string,
  errorCode?: string,
  sequenceNumber: number,
  createdAtBlock: number,
  auxAmounts: string[],
}

export type InvoiceStatus =
  'Created'
  | 'Paid'
  | 'Confirmed'
  | 'OverPaid'
  | 'UnderPaid'
  | 'Expired'
  | 'Invalid';


export type BlockhainType =
  'BinanceMainNet'
  | 'BinanceTestNet'
  | 'PolygonMainNet'
  | 'PolygonMumbaiNet'

export interface TokenInfo {
  address: string,
  blockchain: BlockhainType
}

export const TokensInfo: Record<TokenType, TokenInfo> = {
  bBUSD: {
    blockchain: 'BinanceMainNet',
    address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  },
  bUSDT: {
    blockchain: 'BinanceMainNet',
    address: '0x55d398326f99059fF775485246999027B3197955',
  },
  //
  btBUSD: {
    blockchain: 'BinanceTestNet',
    address: '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee',
  },
  btMNXe: {
    blockchain: 'BinanceTestNet',
    address: '0xd570e1ee81a8ca94008e1cf75c72b5e7a7b83bc5',
  },
  //
  pUSDC: {
    blockchain: 'PolygonMainNet',
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  pUSDT: {
    blockchain: 'PolygonMainNet',
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  //
  pmUSDC: {
    blockchain: 'PolygonMumbaiNet',
    address: '0x7A7707cEE9bbF4D2Ce8f227865D456164841e4E5',
  },
  pmUSDT: {
    blockchain: 'PolygonMumbaiNet',
    address: '0x9b3273282f3b68dbF9b2c35f784cB1a012Cd670B',
  },
}