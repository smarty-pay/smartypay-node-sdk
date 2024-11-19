/*
  Smarty Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { removeEnd } from '../util';

import type { ApiOpt } from './type';

export function apiHost({ host, isStaging }: ApiOpt) {
  // custom host
  if (host) return removeEnd(host, '/');

  // staging api
  if (isStaging) return 'https://ncps-api.staging.mnxsc.tech';

  // default prod api
  return 'https://api.smartypay.io';
}
