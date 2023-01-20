/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import {Currency, Network, SignReqProps,} from './types';
import {CryptoUtil} from './util/CryptoUtil';
import {get, post} from './util/NetUtil';
import {isString, removeEnd} from './util';
import {CreateInvoiceReq, CreateInvoiceResp, InvoiceData, InvoiceStatus} from './types/invoice';
import {CreateRechargeAddressReq, CreateRechargeAddressResp} from './types/recharge';
import {GetActivePlansResp, SubscriptionPlan} from './types/subscription';

export {
  CreateInvoiceReq,
  SignReqProps,
  InvoiceData,
  Currency,
  InvoiceStatus,
  Network,
}


export const SmartyPaySubscriptions = {

  async getActivePlans(
    signProps: SignReqProps
  ): Promise<SubscriptionPlan[]> {
    const {plans} = await getSignReq<GetActivePlansResp>(
      '/integration/subscription-plans',
      signProps
    );
    return plans;
  },
}


export const SmartyPayInvoices = {

  /**
   * Create invoice.
   * [Docs](https://docs.smartypay.io/general/authentication#create-invoice-with-signature)
   */
  async createInvoice(
    data: CreateInvoiceReq,
    signProps: SignReqProps
  ): Promise<InvoiceData> {

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
      signProps
    );

    return invoice;
  },

}

export const SmartyPayRecharges = {

  async createRechargeAddress(
    data: CreateRechargeAddressReq,
    signProps: SignReqProps
  ): Promise<CreateRechargeAddressResp>{

    const bodyData: any = {
      cid: data.customerId,
      token: data.token,
    }

    return await postSignReq<CreateRechargeAddressResp>(
      '/integration/push-addresses',
      bodyData,
      signProps
    );
  },
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

export const SmartyPayAPI = {
  invoices: {
    ...SmartyPayInvoices
  },
  subscriptions: {
    ...SmartyPaySubscriptions
  },
  recharges:{
    ...SmartyPayRecharges
  },
  utils: {
    ...SmartyPayUtils
  }
}


async function postSignReq<T>(
  apiPath: string,
  bodyData: any,
  {
    secretKey,
    publicKey,
    timeout,
    host,
  }: SignReqProps
): Promise<T> {

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const body = JSON.stringify(bodyData);
  const messageToSign = ts + `POST${apiPath}` + body;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = removeEnd(host || 'https://api.smartypay.io', '/');

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
  {
    secretKey,
    publicKey,
    timeout,
    host,
  }: SignReqProps
): Promise<T> {

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const messageToSign = ts + `GET${apiPath}`;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = removeEnd(host || 'https://api.smartypay.io', '/');

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