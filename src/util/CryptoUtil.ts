/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import * as crypto from 'crypto';

export const CryptoUtil = {
  base64encode(str: string) {
    return Buffer.from(str, 'utf8').toString('base64');
  },

  hashSha256Hex(msg: string): string {
    return crypto.createHash('sha256').update(msg).digest('hex');
  },

  hmacSha256Hex(secret: string, msg: string): string {
    return crypto.createHmac('sha256', secret).update(msg).digest('hex');
  },
};
