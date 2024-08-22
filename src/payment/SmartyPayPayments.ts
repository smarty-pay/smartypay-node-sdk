/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { normalizePayment } from 'smartypay-client-model';

import { postSignReq } from '../common/postSignReq';
import { OneDayDelta } from '../common/type';
import { isString } from '../util';

import type { CreatePaymentReq, CreatePaymentResp } from './type';
import type { ApiOpt } from '../common/type';
import type { Payment } from 'smartypay-client-model';

export class SmartyPayPayments {
  constructor(private readonly apiOpt: ApiOpt) {}

  /**
   * Create payment.
   * [Docs](https://docs.smartypay.io/general/authentication#create-payment-with-signature)
   */
  async createPayment(data: CreatePaymentReq): Promise<Payment> {
    const expiresAt = data.expiresAt ?? new Date(Date.now() + OneDayDelta);
    const bodyData: Record<string, any> = {
      expiresAt: expiresAt.toISOString(),
      amount: data.amount,
    };

    if (data.metadata) {
      bodyData.metadata = isString(data.metadata) ? data.metadata : JSON.stringify(data.metadata);
    }

    const { payment } = await postSignReq<CreatePaymentResp>('/integration/payments', bodyData, this.apiOpt);

    return normalizePayment(payment);
  }
}
