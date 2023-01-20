import {Network, Currency} from './index';


export interface GetActivePlansResp {
  plans: SubscriptionPlan[],
}

export interface GetSubscriptionsResp {
  subscriptions: Subscription[],
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
  mode: SubscriptionMode,
  createdAt: string,
  metadata: string,
  status: SubscriptionStatus,
}

export type SubscriptionMode = 'Standard' | 'Simple';

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