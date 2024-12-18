import { User } from '@grammyjs/types';

export enum AlertType {
  PRICE_ABOVE = 'above',
  PRICE_BELOW = 'below',
  GAS_BELOW = 'gas_below',
}
  
export enum InfoType {
  INFO = 'info',
  GAS_PRICE = 'gas',
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

export const tokenMapIds: TokenMapId[] = [
 { id: 'bitcoin', symbols: ['btc'] },
 { id: 'ethereum', symbols: ['eth'] },
 { id: 'pulsechain', symbols: ['pls'] },
 { id: 'cardano', symbols: ['ada'] },
 { id: 'solana', symbols: ['sol'] },
 { id: 'vechain', symbols: ['vet'] },
 { id: 'gala', symbols: ['gala'] },
 { id: 'ripple', symbols: ['xrp'] },
 { id: 'polygon-ecosystem-token', symbols: ['pol', 'matic', 'polygon'] },
 { id: 'stellar', symbols: ['xlm'] },
 { id: 'dogecoin', symbols: ['doge'] },
 { id: 'hex', symbols: ['ehex'] },
 { id: 'hex-pulsechain', symbols: ['hex', 'phex'] },
 { id: 'the-sandbox', symbols: ['sand'] },
 { id: 'crypto-com-chain', symbols: ['cro', 'cronos'] },
 { id: 'kaspa', symbols: ['kas'] },
];

