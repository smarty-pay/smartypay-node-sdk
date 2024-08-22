/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { getMessageSignature } from './common/getMessageSignature';
import { isValidSignature } from './common/isValidSignature';
import { SmartyPayPayments } from './payment/SmartyPayPayments';
import { CreatePaymentReq, CreatePaymentResp } from './payment/type';
import { SmartyPayRecharges } from './recharge/SmartyPayRecharges';
import { SmartyPaySubscriptions } from './subscription/SmartyPaySubscriptions';

import type { ApiOpt } from './common/type';
import type { SubsApiOpt } from './subscription/type';

export { ApiOpt };

export { SmartyPayPayments, CreatePaymentReq, CreatePaymentResp };
export { Payment } from 'smartypay-client-model';

export { SmartyPaySubscriptions };
export { DefaultSkipStatuses } from './subscription/type';
export type {
  CreateCustomerTokenReq,
  CreateSubscriptionReq,
  GetPlansResp,
  GetSubscriptionChargesResp,
  GetSubscriptionsByPayerResp,
  SubsApiOpt,
} from './subscription/type';
export type {
  Subscription,
  SubscriptionCharge,
  SubscriptionId,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from 'smartypay-client-model';

export { SmartyPayRecharges };
export type { CreateRechargeAddressReq, CreateRechargeAddressResp } from './recharge/type';

export { getMessageSignature, isValidSignature };

export class SmartyPayAPI {
  public readonly payments: SmartyPayPayments;
  public readonly subscriptions: SmartyPaySubscriptions;
  public readonly recharges: SmartyPayRecharges;

  constructor(apiOpt: ApiOpt | SubsApiOpt) {
    this.payments = new SmartyPayPayments(apiOpt);
    this.subscriptions = new SmartyPaySubscriptions(apiOpt);
    this.recharges = new SmartyPayRecharges(apiOpt);
  }

  static readonly utils = {
    getMessageSignature,
    isValidSignature,
  };
}
