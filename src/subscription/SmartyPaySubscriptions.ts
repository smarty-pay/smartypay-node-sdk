/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { getSignReq } from '../common/getSignReq';
import { postSignReq } from '../common/postSignReq';

import { DefaultSkipStatuses } from './type';

import type {
  CreateCustomerTokenReq,
  CreateSubscriptionReq,
  GetPlansResp,
  GetSubscriptionChargesResp,
  GetSubscriptionsByPayerResp,
  SubsApiOpt,
} from './type';
import type {
  Subscription,
  SubscriptionCharge,
  SubscriptionId,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from 'smartypay-client-model';

export class SmartyPaySubscriptions {
  constructor(private readonly apiOpt: SubsApiOpt) {}

  /**
   * Get subscriptions plans in target statuses
   * @param statusIn
   */
  async getPlans(statusIn: SubscriptionPlanStatus[]): Promise<SubscriptionPlan[]> {
    const { plans } = await getSignReq<GetPlansResp>(
      `/integration/subscription-plans?statusIn=${statusIn.join(',')}`,
      this.apiOpt,
    );
    return plans;
  }

  /**
   * Get active subscriptions plans
   */
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    return this.getPlans(['Active']);
  }

  /**
   * Get active subscription plan by id
   */
  async getActivePlan(planId: string): Promise<SubscriptionPlan | undefined> {
    const list = await this.getActivePlans();
    return list.find((p) => p.id === planId);
  }

  /**
   * Create subscription for payer
   */
  async createSubscription(req: CreateSubscriptionReq): Promise<Subscription> {
    const startFrom: Date = req.startFrom ? new Date(req.startFrom) : new Date();

    return postSignReq<Subscription>(
      '/integration/subscriptions',
      {
        planId: req.planId,
        payer: req.payer,
        customerId: req.customerId,
        metadata: req.metadata,
        startFrom: startFrom.toISOString(),
      },
      this.apiOpt,
    );
  }

  /**
   * Get subscriptions by customer id
   */
  async getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]> {
    const { subscriptions } = await getSignReq<GetSubscriptionsByPayerResp>(
      `/integration/subscriptions?customerId=${customerId}`,
      this.apiOpt,
    );

    return this.filterSubs(subscriptions);
  }

  /**
   * Get subscriptions for payer address
   */
  async getSubscriptionsByPayer(payerAddress: string): Promise<Subscription[]> {
    const { subscriptions } = await getSignReq<GetSubscriptionsByPayerResp>(
      `/integration/subscriptions?payer=${payerAddress}`,
      this.apiOpt,
    );

    return this.filterSubs(subscriptions);
  }

  /**
   * Get subscription by its contractAddress
   */
  async getSubscription({ contractAddress }: SubscriptionId): Promise<Subscription> {
    return getSignReq<Subscription>(`/integration/subscriptions/${contractAddress}`, this.apiOpt);
  }

  /**
   * Get subscription's charges by its contractAddress
   */
  async getSubscriptionCharges({ contractAddress }: SubscriptionId): Promise<SubscriptionCharge[]> {
    const { charges } = await getSignReq<GetSubscriptionChargesResp>(
      `/integration/subscriptions/${contractAddress}`,
      this.apiOpt,
    );
    return charges;
  }

  /**
   * Create session token for external subscription widget access
   */
  async createCustomerToken({ customerId }: CreateCustomerTokenReq): Promise<string> {
    const { token } = await postSignReq<{ token: string }>(
      '/integration/subscriptions/create-customer-token',
      {
        customerId,
      },
      this.apiOpt,
    );

    return token;
  }

  /** ignore Draft and Cancelled and other unimportant statuses  */
  private filterSubs(list: Subscription[]): Subscription[] {
    const blackList = this.apiOpt.subscriptions?.skipStatuses ?? DefaultSkipStatuses;

    return (list || []).filter((sub) => !blackList.includes(sub.status));
  }
}
