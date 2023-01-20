/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */


import {Currency} from './index';


export interface CreateRechargeAddressReq {
  customerId: string,
  token: Currency,
}


export interface CreateRechargeAddressResp {
  address: string,
  token: string,
}