/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import {CreateInvoiceReq, CreateInvoiceResp, InvoiceData} from './types';
import {CryptoUtil} from './util/CryptoUtil';
import {post} from './util/NetUtil';
import {removeEnd} from './util';


export interface CreateInvoiceProps {
  publicKey: string,
  secretKey: string,
  timeout?: number,
  host?: string,
}

export const SmartyPayAPI = {

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
      amount: data.amount,
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
  }

}