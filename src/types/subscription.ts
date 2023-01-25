/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/


import {Currency, Network} from 'smartypay-client-model';

export interface GetActivePlansResp {
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

export interface SubscriptionId {
  contractAddress: string
}



export interface SubscriptionPlan {
  id: string,
  companyId: number,
  description: string,
  amount: string,
  periodSeconds: number,
  createdAt: string,
  status: SubscriptionPlanStatus,
  tags: string[],
}


export type SubscriptionPlanStatus = 'Draft' | 'Active' | 'Archived'



export interface Subscription {
  contractAddress: string,
  planId: string,
  asset: Currency,
  blockchain: Network,
  customerId: string,
  nextChargeAt: string,
  payer: string,
  createdAt: string,
  metadata?: string,
  status: SubscriptionStatus,
}

export type SubscriptionStatus =
  'Draft'
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'PendingPause'
  | 'Paused'
  | 'PendingUnPause'
  | 'Finished'
  | 'PendingCancel'
  | 'Cancelled'
  | 'Error';



export interface SubscriptionCharge {
  id: string,
  contractAddress: string,
  amount: string,
  chargeDate: string,
  status: SubscriptionChargeStatus,
}


export type SubscriptionChargeStatus =
  "Pending"
  | "Succeeded"
  | "Retrying"
  | "Failed"
  | "Cancelled";