/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */

export const CurrencyKeys = <const>[
  'UNKNOWN',
  // binance
  'bBNB',
  'bBUSD',
  'bUSDT',
  'btMNXe',
  'btUSDTv2',
  'btBUSD',
  // polygon
  'pUSDC',
  'pUSDT',
  'pmUSDC',
  'pmUSDT',
  // arbitrum
  'aUSDC',
  'aUSDT',
  'atUSDC',
  'atUSDT',
];

export type Currency = typeof CurrencyKeys[number];


export type Network =
  | 'BinanceMainNet'
  | 'BinanceTestNet'
  | 'PolygonMainNet'
  | 'PolygonMumbaiNet'
  | 'ArbitrumMainNet'
  | 'ArbitrumTestNet';


export interface SignReqProps {
  publicKey: string,
  secretKey: string,
  timeout?: number,
  host?: string,
}