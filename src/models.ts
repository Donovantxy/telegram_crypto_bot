import { User } from '@grammyjs/types';

export enum AlertType {
  PRICE_ABOVE = 'above',
  PRICE_BELOW = 'below',
  REMOVE_ALERT = 'remove',
  GAS_BELOW = 'gas_below',
}
  
export enum InfoType {
  INFO = 'info',
  GWEI = 'gwei',
}

export interface AlertPool {
  priceAlerts: {
    [tokenId: string]: {
      alerts: PriceAlert[]
    };
  }
}

export class PriceAlert {
  constructor(
    public type: AlertType,
    public messageText = '',
    public tokenId: string,
    public targetPrice: number,
    public chatId: number,
    public from?: User,
    public name?: string,
    public image?: string
  ) {}
}

export interface TokenMapId {
  id: string;
  symbols: string[];
}

export interface SimplePriceResp {
  [tokenId: string]: SimplePrice;
}

export interface SimplePrice {
  usd: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
}

export interface CoinMarketDataResp {
  id: string;
  symbol: string;
  name: string;
  image: string; // "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400"
  current_price: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
  market_cap_rank: 1;
  fully_diluted_valuation: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string; // "2024-12-05T03:10:51.885Z";
  atl: number;
  atl_change_percentage: number;
  atl_date: string; // "2013-07-06T00:00:00.000Z";
  roi: string;
  last_updated: string; // "2024-12-10T18:41:37.841Z"
}

export interface GasOracleResponse {
  status: string, // number
  message: string,
  result: {
    LastBlock: string, // number
    SafeGasPrice: string, // number - in Gwei - low
    ProposeGasPrice: string, // number - in Gwei - middle
    FastGasPrice: string, // number - in Gwei - high
    suggestBaseFee: string, // number - in Gwei
    gasUsedRatio: string; // "0.486672,0.359059766666667,0.6722545,0.381628406527692,0.5149747"
  }
}

export const tokenMapIds: TokenMapId[] = [
 { id: 'bitcoin', symbols: ['btc'] },
 { id: 'ethereum', symbols: ['eth'] },
 { id: 'pulsechain', symbols: ['pls'] },
 { id: 'pulsex', symbols: ['plsx'] },
 { id: 'cardano', symbols: ['ada'] },
 { id: 'solana', symbols: ['sol'] },
 { id: 'vechain', symbols: ['vet'] },
 { id: 'gala', symbols: ['gala'] },
 { id: 'ripple', symbols: ['xrp'] },
 { id: 'polygon-ecosystem-token', symbols: ['pol', 'matic', 'polygon'] },
 { id: 'stellar', symbols: ['xlm'] },
 { id: 'dogecoin', symbols: ['doge'] },
 { id: 'hex', symbols: ['ehex'] },
 { id: 'hex-pulsechain', symbols: ['phex', 'hex'] },
 { id: 'the-sandbox', symbols: ['sand'] },
 { id: 'crypto-com-chain', symbols: ['cro', 'cronos'] },
 { id: 'kaspa', symbols: ['kas'] },
 { id: 'tether', symbols: ['usdt'] },
 { id: 'binance-bridged-usdc-bnb-smart-chain', symbols: ['usdc'] },
 { id: 'binance-peg-busd', symbols: ['busd'] },
 { id: 'binancecoin', symbols: ['bnb'] },
 { id: 'tron', symbols: ['trx'] },
 { id: 'avalanche-2', symbols: ['avax', 'avalanche'] },
 { id: 'chainlink', symbols: ['link'] },
 { id: 'shiba-inu', symbols: ['shib'] },
 { id: 'polkadot', symbols: ['dot'] },
 { id: 'hedera-hashgraph', symbols: ['hbar', 'hedera'] },
 { id: 'uniswap', symbols: ['uni'] },
 { id: 'near', symbols: ['near'] },
 { id: 'fantom', symbols: ['ftm'] },
 { id: 'cosmos', symbols: ['atom'] },
 { id: 'injective-protocol', symbols: ['inj', 'injective'] },
 { id: 'thorchain', symbols: ['rune'] },
 { id: 'eos', symbols: ['eos'] },
 { id: 'quant-network', symbols: ['qnt', 'quant'] },
 { id: 'iota', symbols: ['iota'] },
 { id: 'neo', symbols: ['neo'] },
 { id: 'elrond-erd-2', symbols: ['egld', 'elrond'] },
 { id: 'decentraland', symbols: ['mana'] },
 { id: 'nexo', symbols: ['nexo'] },
 { id: 'pancakeswap-token', symbols: ['cake', 'pancakeswap', 'pancake'] },
 { id: 'ronin', symbols: ['ron'] },
 { id: 'oasis-network', symbols: ['rose', 'oasis'] },
 { id: 'terra-luna', symbols: ['lunc', 'luna-classic', 'lunac'] },
 { id: 'trust-wallet-token', symbols: ['twt', 'trust'] },
 { id: 'true-usd', symbols: ['tusd'] },
 { id: 'dash', symbols: ['dash'] },
 { id: 'nano', symbols: ['xno'] },
 { id: 'ark', symbols: ['ark'] },
 { id: 'xion-2', symbols: ['xion'] },
 { id: 'dao-maker', symbols: ['dao'] },
 { id: 'star-atlas', symbols: ['atlas'] },
 { id: 'harmony', symbols: ['one'] },
 { id: 'usual', symbols: ['usual'] },
 { id: 'ftx-token', symbols: ['ftx', 'ftt'] }
];

