/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { CryptoUtil } from '../util/CryptoUtil';
import { post } from '../util/NetUtil';

import { apiHost } from './apiHost';

import type { ApiOpt } from './type';

export async function postSignReq<T>(apiPath: string, bodyData: any, signReq: ApiOpt): Promise<T> {
  const { secretKey, publicKey, timeout } = signReq;

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const body = JSON.stringify(bodyData);
  const messageToSign = `${ts}POST${apiPath}${body}`;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = apiHost(signReq);

  const resp = await post(`${targetHost}${apiPath}`, body, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': publicKey,
      'x-api-sig': sig,
      'x-api-ts': ts,
    },
    timeout,
  });

  return JSON.parse(resp) as T;
}
