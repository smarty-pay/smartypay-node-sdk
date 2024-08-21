/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import type { Currency, Payment } from 'smartypay-client-model';

export interface CreatePaymentReq {
  expiresAt: Date;
  amount: number | string;
  token: Currency;
  metadata?: string | Record<string, any>;
}

export interface CreatePaymentResp {
  payment: Payment;
}
