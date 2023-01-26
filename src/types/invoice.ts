/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/


import {Currency, Invoice} from 'smartypay-client-model';

export interface CreateInvoiceReq {
  expiresAt: Date,
  amount: number | string,
  token: Currency,
  metadata?: string | Record<string, any>,
}


export interface CreateInvoiceResp {
  invoice: Invoice,
}