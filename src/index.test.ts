/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { SmartyPayAPI } from './index';

import type { ApiOpt, CreatePaymentReq } from './index';

const OneHourDelta = 1000 * 60 * 60;

describe('SmartyPayAPI', () => {
  // test access on stage
  const PublicKey = 's5FGH1xnRMs6WGPEFX9oIlxYDYEYX4Sg';
  const SecretKey = 'ltbUjBfqXqwJLf3hToVTTvHho5YRaR3SnL2Dh20x3P3f0A462gmMlUa4pfYq1ScM';

  describe('utils', () => {
    const { utils } = SmartyPayAPI;

    const message = 'test data';
    const secret = 'test key';
    // generated by https://www.devglan.com/online-tools/hmac-sha256-online
    const signature = '4695788ca94015a246422be13bbd966ade571842efc3a39296bdb6f2377597ff';

    test('getMessageSignature', () => {
      expect(utils.getMessageSignature(message, secret)).toBe(signature);
      expect(utils.getMessageSignature(`NOT-${message}`, secret)).not.toBe(signature);
      expect(utils.getMessageSignature(message, `NOT-${secret}`)).not.toBe(signature);
    });

    test('isValidSignature', () => {
      expect(utils.isValidSignature(message, signature, secret)).toBe(true);
      expect(utils.isValidSignature(`NOT-${message}`, signature, secret)).toBe(false);
      expect(utils.isValidSignature(message, `NOT-${signature}`, secret)).toBe(false);
      expect(utils.isValidSignature(message, signature, `NOT-${secret}`)).toBe(false);
    });
  });

  describe('payments', () => {
    const apiOpt: ApiOpt = {
      isStaging: true,
      publicKey: PublicKey,
      secretKey: SecretKey,
    };

    const api = new SmartyPayAPI(apiOpt).payments;

    test('createPayment', async () => {
      const req: CreatePaymentReq = {
        amount: {
          value: '1',
          currency: 'btUSDTv2',
        },
      };
      const result = await api.createPayment(req);

      expect(result).not.toBeUndefined();
      expect(result.status).toBe('Created');
      expect(result.amount.value).toBe(req.amount.value);
      expect(result.amount.currency).toBe(req.amount.currency);
      expect(result.expiresAt > new Date(Date.now() + OneHourDelta)).toBe(true);
      expect(result.expiresAt < new Date(Date.now() + OneHourDelta * 24 * 30)).toBe(true);
    });
  });

  describe('subscriptions', () => {
    const apiOpt: ApiOpt = {
      isStaging: true,
      publicKey: PublicKey,
      secretKey: SecretKey,
    };

    const api = new SmartyPayAPI(apiOpt).subscriptions;

    const payerAddress = '0x14186C8215985f33845722730c6382443Bf9EC65';

    test('createCustomerToken', async () => {
      const customerId = '1';
      const customerId2 = '2';

      const token1 = await api.createCustomerToken({ customerId });
      const token2 = await api.createCustomerToken({ customerId });
      const token3 = await api.createCustomerToken({ customerId: customerId2 });

      expect(token1).not.toBeUndefined();
      expect(token1).not.toEqual(token2);
      expect(token1).not.toEqual(token3);
      expect(token2).not.toEqual(token3);
    });

    test('getPlans', async () => {
      const plansInActive = await api.getPlans(['Active']);
      for (const plan of plansInActive) {
        expect(plan.status).toBe('Active');
      }

      const plansInArchived = await api.getPlans(['Archived']);
      for (const plan of plansInArchived) {
        expect(plan.status).toBe('Archived');
      }

      const plansInDraft = await api.getPlans(['Draft']);
      for (const plan of plansInDraft) {
        expect(plan.status).toBe('Draft');
      }

      const plansInMix = await api.getPlans(['Active', 'Archived']);
      expect(plansInMix.length).toBe(plansInActive.length + plansInArchived.length);

      const activePlans = await api.getActivePlans();
      expect(JSON.stringify(plansInActive)).toEqual(JSON.stringify(activePlans));
      expect(JSON.stringify(plansInArchived)).not.toEqual(JSON.stringify(activePlans));
    });

    test('getSubscriptionPlans', async () => {
      const plans = await api.getActivePlans();
      expect(plans).not.toBeUndefined();
      expect(plans.length).toBeGreaterThan(0);
    });

    test('getSubscriptionPlanById', async () => {
      const plans = await api.getActivePlans();
      const planId = plans[0].id;

      const plan = await api.getActivePlan(planId);
      expect(plan).not.toBeUndefined();
      expect(plan?.id).toBe(planId);

      const noPlan = await api.getActivePlan('unknown-id');
      expect(noPlan).toBeUndefined();
    });

    test('getSubscriptionsByPayer', async () => {
      const subs = await api.getSubscriptionsByPayer(payerAddress);
      expect(subs).not.toBeUndefined();
      if (subs.length > 0) {
        expect(subs[0].payer).toBe(payerAddress);
      }
    });

    test('createSubscription', async () => {
      try {
        const resp = await api.createSubscription({
          planId: 'BAD_PLAN_ID',
          payer: payerAddress,
          customerId: 'some',
          metadata: 'some',
        });

        console.log('unexpected resp', resp);
        throw new Error('exception expected');
      } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const response = e.response as { status: number; code: string; message: string };
        expect(response).not.toBeUndefined();
        expect(response.status).toBe(400);
        expect(response.code).toBe('BadRequest');
        expect(response.message).toBe('Invalid value for: body');
      }
    });
  });
});
