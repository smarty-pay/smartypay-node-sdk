/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/


import {Currency} from 'smartypay-client-model';

export interface CreateInvoiceReq {
  expiresAt: Date,
  amount: number | string,
  token: Currency,
  metadata?: string | Record<string, any>,
}


export interface CreateInvoiceResp {
  invoice: InvoiceData,
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