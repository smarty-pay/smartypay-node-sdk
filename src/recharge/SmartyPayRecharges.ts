/*
  Smarty Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { postSignReq } from '../common/postSignReq';

import type { CreateRechargeAddressReq, CreateRechargeAddressResp } from './type';
import type { ApiOpt } from '../common/type';

export class SmartyPayRecharges {
  constructor(private readonly apiOpt: ApiOpt) {}

  async createRechargeAddress(data: CreateRechargeAddressReq): Promise<CreateRechargeAddressResp> {
    const bodyData: any = {
      cid: data.customerId,
      token: data.token,
    };

    return postSignReq<CreateRechargeAddressResp>('/integration/recharge-addresses', bodyData, this.apiOpt);
  }
}
