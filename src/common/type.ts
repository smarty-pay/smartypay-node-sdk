/*
  Smarty Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import type { Currency } from 'smartypay-client-model';

export interface ApiOpt {
  publicKey: string;
  secretKey: string;
  timeout?: number;
  host?: string;
  isStaging?: boolean;
}

export interface Amount {
  value: string;
  currency: Currency;
}

export const OneDayDelta = 1000 * 60 * 60 * 24;
