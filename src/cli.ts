#!/usr/bin/env node

/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import { SmartyPayAPI } from './index';

import type { Currency } from 'smartypay-client-model';

type StateType = 'unknown' | 'payment-wait-data' | 'payment-confirm' | 'payment-call';

type PaymentKey = 'amount' | 'token' | 'expiresAt' | 'publicKey' | 'secretKey' | 'metadata';

const NextLineInput = '\ncli: ';
const { stdin, stdout } = process;

let state: StateType = 'unknown';
let paymentReq: Record<PaymentKey, string | undefined>;
let inProgress = false;

stdout.write('Welcome to SMARTy Pay CLI');
stdout.write("\nEnter 'help' for see all commands");
stdout.write(NextLineInput);

stdin.addListener('data', (d) => {
  // skip input
  if (inProgress) return;

  const input = d.toString().trim();

  if (state === 'unknown') {
    processUnknownState(input);
  } else if (state === 'payment-wait-data') {
    processPaymentReq(input);
  } else if (state === 'payment-confirm') {
    processPaymentConfirm(input);
  } else {
    stdout.write(`unknown input '${input}'. Try 'help' command`);
  }

  if (!inProgress) {
    stdout.write(NextLineInput);
  }
});

function processUnknownState(input: string) {
  if (input === 'help') {
    printHelp();
    return;
  }

  if (input === 'exit') {
    stdout.write('\nGoodbye!');
    process.exit(0);
    return;
  }

  if (input === 'payment') {
    state = 'payment-wait-data';
    paymentReq = {
      amount: undefined,
      token: undefined,
      expiresAt: undefined,
      publicKey: undefined,
      secretKey: undefined,
      metadata: undefined,
    };

    processPaymentReq();
    return;
  }

  stdout.write(`unknown input '${input}'. Try 'help' command`);
}

function printHelp() {
  stdout.write('[Command list]');
  stdout.write("\n'help' - print current help message");
  stdout.write("\n'payment' - create new payment");
  stdout.write("\n'exit' - close cli");
}

function processPaymentReq(input?: string) {
  if (input || input === '') {
    const curKey = findEmptyPaymentKey();
    if (curKey) {
      setPaymentKey(curKey, input);
    }
  }

  const nextKey = findEmptyPaymentKey();
  if (nextKey) {
    stdout.write(`Enter value for '${nextKey}'...`);
  } else {
    state = 'payment-confirm';
    stdout.write(`Create payment with data\n${JSON.stringify(paymentReq, null, 2)}\ny/n?`);
  }
}

function processPaymentConfirm(input: string) {
  const confirm = input.toLowerCase();
  if (confirm === 'y' || confirm === 'yes' || confirm === '1') {
    state = 'payment-call';
    stdout.write('payment creating. Please wait...\n\n');
    createPayment().catch(onError);
  } else {
    state = 'unknown';
    stdout.write('Operation canceled.\n\n');
    printHelp();
  }
}

async function createPayment() {
  if (inProgress) return;

  inProgress = true;
  try {
    const cred = {
      secretKey: paymentReq.secretKey!,
      publicKey: paymentReq.publicKey!,
    };

    const api = new SmartyPayAPI(cred);

    const result = await api.payments.createPayment({
      expiresAt: paymentReq.expiresAt ? new Date(paymentReq.expiresAt) : undefined,
      amount: {
        value: paymentReq.amount!,
        currency: paymentReq.token! as Currency,
      },
      metadata: paymentReq.metadata,
    });

    state = 'unknown';

    console.log('Payment', result);
    console.log('');
  } catch (e: any) {
    state = 'unknown';
    console.log('Cannot create payment:', e.message, e.body);
    console.log('');
    printHelp();
  } finally {
    inProgress = false;
    stdout.write(NextLineInput);
  }
}

function onError(e: any) {
  console.log('Got error', e);
}

function findEmptyPaymentKey(): PaymentKey | undefined {
  return Object.keys(paymentReq).find((key) => paymentReq[key as PaymentKey] === undefined) as PaymentKey | undefined;
}

function setPaymentKey(key: PaymentKey, value: string) {
  paymentReq[key] = value;
}
