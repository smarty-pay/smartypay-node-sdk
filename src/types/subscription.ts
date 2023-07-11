/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/


import {Subscription, SubscriptionCharge, SubscriptionPlan} from 'smartypay-client-model';

export interface GetPlansResp {
  plans: SubscriptionPlan[],
}

export interface GetSubscriptionsByPayerResp {
  subscriptions: Subscription[],
}

export interface GetSubscriptionChargesResp {
  charges: SubscriptionCharge[]
}


export interface CreateSubscriptionReq {
  planId: string,
  payer: string,
  customerId: string,
  metadata?: string,
  startFrom?: Date|string|number,
}