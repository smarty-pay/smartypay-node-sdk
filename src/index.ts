/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/
import {CryptoUtil} from './util/CryptoUtil';
import {get, post} from './util/NetUtil';
import {isString, removeEnd} from './util';
import {CreateInvoiceReq, CreateInvoiceResp} from './types/invoice';
import {CreateRechargeAddressReq, CreateRechargeAddressResp} from './types/recharge';
import {
  CreateSubscriptionReq,
  GetPlansResp,
  GetSubscriptionChargesResp,
  GetSubscriptionsByPayerResp,
  CreateCustomerTokenReq,
} from './types/subscription';
import {
  Invoice,
  Subscription,
  SubscriptionCharge,
  SubscriptionId,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionPlanStatus,
} from 'smartypay-client-model';

export {
  CreateInvoiceReq,
}

export interface ApiOpt {
  publicKey: string,
  secretKey: string,
  timeout?: number,
  host?: string,
  isStaging?: boolean,
  subscriptions?: SubscriptionsApiOpt,
}

export interface SubscriptionsApiOpt {
  skipStatuses?: SubscriptionStatus[]
}

export const DefaultSkipStatuses: SubscriptionStatus[] = [
  'Draft',
  'Suspended',
  'Cancelled',
  'PendingCancel',
  'Error',
  'Finished'
];

export class SmartyPaySubscriptions {

  constructor(private readonly apiOpt: ApiOpt) {}


  /**
   * Get subscriptions plans in target statuses
   * @param statusIn
   */
  async getPlans(statusIn: SubscriptionPlanStatus[]): Promise<SubscriptionPlan[]> {
    const {plans} = await getSignReq<GetPlansResp>(
      `/integration/subscription-plans?statusIn=${statusIn.join(',')}`,
      this.apiOpt
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
  async getActivePlan(planId: string): Promise<SubscriptionPlan|undefined> {
    const list = await this.getActivePlans();
    return list.find(p => p.id === planId);
  }

  /**
   * Create subscription for payer
   */
  async createSubscription(req: CreateSubscriptionReq): Promise<Subscription> {

    const startFrom: Date = req.startFrom? new Date(req.startFrom) : new Date();

    return await postSignReq<Subscription>(
      '/integration/subscriptions',
      {
        planId: req.planId,
        payer: req.payer,
        customerId: req.customerId,
        metadata: req.metadata,
        startFrom: startFrom.toISOString(),
      },
      this.apiOpt
    );
  }

  /**
   * Get subscriptions by customer id
   */
  async getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]> {

    const {subscriptions} = await getSignReq<GetSubscriptionsByPayerResp>(
      `/integration/subscriptions?customerId=${customerId}`,
      this.apiOpt,
    );

    return this.filterSubs(subscriptions);
  }

  /**
   * Get subscriptions for payer address
   */
  async getSubscriptionsByPayer(payerAddress: string): Promise<Subscription[]> {

    const {subscriptions} = await getSignReq<GetSubscriptionsByPayerResp>(
      `/integration/subscriptions?payer=${payerAddress}`,
      this.apiOpt,
    );

    return this.filterSubs(subscriptions);
  }

  /**
   * Get subscription by its contractAddress
   */
  async getSubscription({contractAddress}: SubscriptionId): Promise<Subscription>{
    return await getSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}`,
      this.apiOpt,
    );
  }

  /**
   * Get subscription's charges by its contractAddress
   */
  async getSubscriptionCharges({contractAddress}: SubscriptionId): Promise<SubscriptionCharge[]>{
    const {charges} =  await getSignReq<GetSubscriptionChargesResp>(
      `/integration/subscriptions/${contractAddress}`,
      this.apiOpt,
    );
    return charges;
  }

  /**
   * Create session token for external subscription widget access
   */
  async createCustomerToken({customerId}: CreateCustomerTokenReq): Promise<string> {

    const {token} = await postSignReq<any>(
      '/integration/subscriptions/create-customer-token',
      {
        customerId
      },
      this.apiOpt
    );

    return token;
  }


  /** ignore Draft and Cancelled and other unimportant statuses  */
  private filterSubs(list: Subscription[]): Subscription[] {

    const blackList = this.apiOpt.subscriptions?.skipStatuses || DefaultSkipStatuses;

    return (list || []).filter(sub => ! blackList.includes(sub.status));
  }
}



export class SmartyPayInvoices {

  constructor(private readonly apiOpt: ApiOpt) {}

  /**
   * Create invoice.
   * [Docs](https://docs.smartypay.io/general/authentication#create-invoice-with-signature)
   */
  async createInvoice(data: CreateInvoiceReq): Promise<Invoice> {

    const bodyData: any = {
      expiresAt: data.expiresAt.toISOString(),
      amount: `${data.amount} ${data.token}`,
    }

    if(data.metadata){
      bodyData.metadata = isString(data.metadata)? data.metadata : JSON.stringify(data.metadata);
    }

    const {invoice} = await postSignReq<CreateInvoiceResp>(
      '/integration/invoices',
      bodyData,
      this.apiOpt
    );

    return invoice;
  }

}

export class SmartyPayRecharges {

  constructor(private readonly apiOpt: ApiOpt) {}

  async createRechargeAddress(data: CreateRechargeAddressReq,): Promise<CreateRechargeAddressResp>{

    const bodyData: any = {
      cid: data.customerId,
      token: data.token,
    }

    return await postSignReq<CreateRechargeAddressResp>(
      '/integration/recharge-addresses',
      bodyData,
      this.apiOpt
    );
  }
}

export const SmartyPayUtils = {

  /**
   * Get Sha256 signature.
   * [Docs](https://docs.smartypay.io/api/webhooks)
   */
  getMessageSignature(message: string, secretKey: string): string {
    return CryptoUtil.hmacSha256Hex(secretKey, message);
  },

  /**
   * Check Sha256 signature.
   * [Docs](https://docs.smartypay.io/api/webhooks)
   */
  isValidSignature(message: string, signature: string, secretKey: string): boolean {
    return SmartyPayUtils.getMessageSignature(message, secretKey) === signature;
  }

}

export class SmartyPayAPI {

  public readonly invoices: SmartyPayInvoices;
  public readonly subscriptions: SmartyPaySubscriptions;
  public readonly recharges: SmartyPayRecharges;

  constructor(apiOpt: ApiOpt) {
    this.invoices = new SmartyPayInvoices(apiOpt);
    this.subscriptions = new SmartyPaySubscriptions(apiOpt);
    this.recharges = new SmartyPayRecharges(apiOpt);
  }

  static readonly utils = {
    ...SmartyPayUtils
  }
}


async function postSignReq<T>(
  apiPath: string,
  bodyData: any,
  signReq: ApiOpt
): Promise<T> {

  const {
    secretKey,
    publicKey,
    timeout,
  } = signReq;

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const body = JSON.stringify(bodyData);
  const messageToSign = ts + `POST${apiPath}` + body;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = apiHost(signReq);

  const resp = await post(`${targetHost}${apiPath}`, body, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': publicKey,
      'x-api-sig': sig,
      'x-api-ts': ts,
    },
    timeout,
  });

  return JSON.parse(resp) as T;
}



async function getSignReq<T>(
  apiPath: string,
  apiOpt: ApiOpt,
): Promise<T> {

  const {
    secretKey,
    publicKey,
    timeout,
  } = apiOpt;

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const messageToSign = ts + `GET${apiPath}`;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = apiHost(apiOpt);

  const resp = await get(`${targetHost}${apiPath}`, undefined, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': publicKey,
      'x-api-sig': sig,
      'x-api-ts': ts,
    },
    timeout,
  });

  return JSON.parse(resp) as T;
}


function apiHost({host, isStaging}: ApiOpt){

  // custom host
  if(host)
    return removeEnd(host, '/');

  // staging api
  if(isStaging)
    return 'https://ncps-api.staging.mnxsc.tech';

  // default prod api
  return 'https://api.smartypay.io';
}