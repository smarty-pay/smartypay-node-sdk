/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import {CreateInvoiceProps, CreateInvoiceReq, CreateInvoiceResp, InvoiceData, TokenType, InvoiceStatus} from './types';
import {CryptoUtil} from './util/CryptoUtil';
import {post} from './util/NetUtil';
import {removeEnd} from './util';

export {CreateInvoiceReq, CreateInvoiceProps, InvoiceData, TokenType, InvoiceStatus}


export const SmartyPayAPI = {

  /**
   * Create invoice.
   * [Docs](https://docs.smartypay.io/general/authentication#create-invoice-with-signature)
   */
  async createInvoice(
    data: CreateInvoiceReq,
    {
      secretKey,
      publicKey,
      timeout,
      host,
    }: CreateInvoiceProps): Promise<InvoiceData> {

    const now = Date.now();
    const ts = Math.round(now / 1000).toString();

    const body = JSON.stringify({
      expiresAt: data.expiresAt.toISOString(),
      amount: `${data.amount} ${data.token}`,
    });

    const messageToSign = ts + 'POST/integration/invoices' + body;
    const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
    const targetHost = removeEnd(host || 'https://api.smartypay.io', '/');

    const resp = await post(`${targetHost}/integration/invoices`, body, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': publicKey,
        'x-api-sig': sig,
        'x-api-ts': ts,
      },
      timeout,
    });

    const {invoice} = JSON.parse(resp) as CreateInvoiceResp;

    return invoice;
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