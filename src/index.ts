/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <e.dolganov@smartypay.io>
 */
import {Currency, Network, SignReqProps,} from './types';
import {CryptoUtil} from './util/CryptoUtil';
import {get, post} from './util/NetUtil';
import {isString, removeEnd} from './util';
import {CreateInvoiceReq, CreateInvoiceResp, InvoiceData, InvoiceStatus} from './types/invoice';
import {CreateRechargeAddressReq, CreateRechargeAddressResp} from './types/recharge';
import {
  CreateSubscriptionReq,
  GetActivePlansResp, GetSubscriptionChargesResp,
  GetSubscriptionsByPayerResp,
  Subscription, SubscriptionCharge, SubscriptionId,
  SubscriptionPlan
} from './types/subscription';

export {
  CreateInvoiceReq,
  SignReqProps,
  InvoiceData,
  Currency,
  InvoiceStatus,
  Network,
}


export class SmartyPaySubscriptions {

  constructor(private readonly signProps: SignReqProps) {}

  /**
   * Get active subscriptions plans
   */
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const {plans} = await getSignReq<GetActivePlansResp>(
      '/integration/subscription-plans',
      this.signProps
    );
    return plans;
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
      this.signProps
    );
  }

  /**
   * Get subscriptions for payer address
   */
  async getSubscriptionsByPayer(payerAddress: string): Promise<Subscription[]> {
    const {subscriptions} = await getSignReq<GetSubscriptionsByPayerResp>(
      `/integration/subscriptions?payer=${payerAddress}`,
      this.signProps,
    );
    return subscriptions;
  }

  /**
   * Get subscription by its contractAddress
   */
  async getSubscription({contractAddress}: SubscriptionId): Promise<Subscription>{
    return await getSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}`,
      this.signProps,
    );
  }

  /**
   * Activate subscription for payer by its contractAddress
   */
  async activateSubscription({contractAddress}: SubscriptionId): Promise<Subscription>{
    return await postSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}/activate`,
      {},
      this.signProps
    );
  }

  /**
   * Pause subscription for payer by its contractAddress
   */
  async pauseSubscription({contractAddress}: SubscriptionId): Promise<Subscription> {
    return await postSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}/pause`,
      {},
      this.signProps
    );
  }

  /**
   * Unpause subscription for payer by its contractAddress
   */
  async unpauseSubscription({contractAddress}: SubscriptionId): Promise<Subscription> {
    return await postSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}/unpause`,
      {},
      this.signProps
    );
  }

  /**
   * Get subscription's charges by its contractAddress
   */
  async getSubscriptionCharges({contractAddress}: SubscriptionId): Promise<SubscriptionCharge[]>{
    const {charges} =  await getSignReq<GetSubscriptionChargesResp>(
      `/integration/subscriptions/${contractAddress}`,
      this.signProps,
    );
    return charges;
  }

  /**
   * Cancel subscription for payer by his contractAddress
   */
  async cancelSubscription({contractAddress}: SubscriptionId): Promise<Subscription> {
    return await postSignReq<Subscription>(
      `/integration/subscriptions/${contractAddress}/cancel`,
      {},
      this.signProps
    );
  }


}


export class SmartyPayInvoices {

  constructor(private readonly signProps: SignReqProps) {}

  /**
   * Create invoice.
   * [Docs](https://docs.smartypay.io/general/authentication#create-invoice-with-signature)
   */
  async createInvoice(data: CreateInvoiceReq): Promise<InvoiceData> {

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
      this.signProps
    );

    return invoice;
  }

}

export class SmartyPayRecharges {

  constructor(private readonly signProps: SignReqProps) {}

  async createRechargeAddress(data: CreateRechargeAddressReq,): Promise<CreateRechargeAddressResp>{

    const bodyData: any = {
      cid: data.customerId,
      token: data.token,
    }

    return await postSignReq<CreateRechargeAddressResp>(
      '/integration/push-addresses',
      bodyData,
      this.signProps
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

  constructor(signProps: SignReqProps) {
    this.invoices = new SmartyPayInvoices(signProps);
    this.subscriptions = new SmartyPaySubscriptions(signProps);
    this.recharges = new SmartyPayRecharges(signProps);
  }

  static readonly utils = {
    ...SmartyPayUtils
  }
}


async function postSignReq<T>(
  apiPath: string,
  bodyData: any,
  signReq: SignReqProps
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
  signReq: SignReqProps,
): Promise<T> {

  const {
    secretKey,
    publicKey,
    timeout,
  } = signReq;

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const messageToSign = ts + `GET${apiPath}`;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = apiHost(signReq);

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


function apiHost({host, isStaging}: SignReqProps){

  // custom host
  if(host)
    return removeEnd(host, '/');

  // staging api
  if(isStaging)
    return 'https://ncps-api.staging.mnxsc.tech';

  // default prod api
  return 'https://api.smartypay.io';
}