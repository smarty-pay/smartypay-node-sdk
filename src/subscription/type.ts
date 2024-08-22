/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import type { ApiOpt } from '../common/type';
import type { Subscription, SubscriptionCharge, SubscriptionPlan, SubscriptionStatus } from 'smartypay-client-model';

export interface SubsApiOpt extends ApiOpt {
  subscriptions?: {
    skipStatuses?: SubscriptionStatus[];
  };
}

export interface GetPlansResp {
  plans: SubscriptionPlan[];
}

export interface GetSubscriptionsByPayerResp {
  subscriptions: Subscription[];
}

export interface GetSubscriptionChargesResp {
  charges: SubscriptionCharge[];
}

export interface CreateSubscriptionReq {
  planId: string;
  payer: string;
  customerId: string;
  metadata?: string;
  startFrom?: Date | string | number;
}

export interface CreateCustomerTokenReq {
  customerId: string;
}

export const DefaultSkipStatuses: SubscriptionStatus[] = [
  'Draft',
  'Suspended',
  'Cancelled',
  'PendingCancel',
  'Error',
  'Finished',
];
