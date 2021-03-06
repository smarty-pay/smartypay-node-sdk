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