/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import type { Amount } from '../common/type';
import type { Payment } from 'smartypay-client-model';

export interface CreatePaymentReq {
  amount: Amount;
  expiresAt?: Date;
  metadata?: string | Record<string, any>;
}

export interface CreatePaymentResp {
  payment: Payment;
}
