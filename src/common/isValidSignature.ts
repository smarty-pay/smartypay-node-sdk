/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { getMessageSignature } from './getMessageSignature';

/**
 * Check Sha256 signature.
 * [Docs](https://docs.smartypay.io/api/webhooks)
 */
export function isValidSignature(message: string, signature: string, secretKey: string): boolean {
  return getMessageSignature(message, secretKey) === signature;
}
