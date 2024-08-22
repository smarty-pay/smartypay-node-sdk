/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { CryptoUtil } from '../util/CryptoUtil';
import { get } from '../util/NetUtil';

import { apiHost } from './apiHost';

import type { ApiOpt } from './type';

export async function getSignReq<T>(apiPath: string, apiOpt: ApiOpt): Promise<T> {
  const { secretKey, publicKey, timeout } = apiOpt;

  const now = Date.now();
  const ts = Math.round(now / 1000).toString();
  const messageToSign = `${ts}GET${apiPath}`;
  const sig = CryptoUtil.hmacSha256Hex(secretKey, messageToSign);
  const targetHost = apiHost(apiOpt);

  const resp = await get(`${targetHost}${apiPath}`, undefined, {
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
