/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import {
  SignReqProps,
  CreateInvoiceReq,
  CreateInvoiceResp,
  InvoiceData,
  TokenType,
  InvoiceStatus,
  CreatePushAddressReq, CreatePushAddressResp, TokensInfo
} from './types';
import {CryptoUtil} from './util/CryptoUtil';
import {post} from './util/NetUtil';
import {isString, removeEnd} from './util';

export {CreateInvoiceReq, SignReqProps, InvoiceData, TokenType, InvoiceStatus}


export const SmartyPayAPI = {

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

  async createPushAddress(
    data: CreatePushAddressReq,
    signProps: SignReqProps
  ): Promise<CreatePushAddressResp>{

    const bodyData: any = {
      cid: data.customerId,
      token: TokensInfo[data.token].address,
      blockchain: TokensInfo[data.token].blockchain,
    }

    return await postSignReq<CreatePushAddressResp>(
      '/integration/push-addresses',
      bodyData,
      signProps
    );
  },

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
    return SmartyPayAPI.getMessageSignature(message, secretKey) === signature;
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