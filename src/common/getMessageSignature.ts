/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { CryptoUtil } from '../util/CryptoUtil';

export function getMessageSignature(message: string, secretKey: string): string {
  return CryptoUtil.hmacSha256Hex(secretKey, message);
}
