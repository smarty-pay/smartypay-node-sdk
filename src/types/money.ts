/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <e.dolganov@smartypay.io>
 */


import {Currency, CurrencyKeys} from './index';


export interface Money {
  amount: string,
  currency: Currency,
}

export function sameMoney(a?: Money, b?: Money){
  return a && b
    && a.amount === b.amount
    && a.currency === b.currency;
}

/** {amount: 100, currency: "USD"} -> "100 USD" */
export function toMoneyString(money: Money){
  return `${money.amount} ${money.currency}`;
}

/** "1.5 USD" -> {amount: 1.5, currency: "USD"} */
export function parseMoney(value: string|Money): Money {

  if((value as Money).currency)
    return value as Money;

  const [amount, currency] = (value as string).split(' ');

  return {
    currency: CurrencyKeys.find(c => c === currency) || 'UNKNOWN',
    amount: amount.trim(),
  };
}