import { User } from '@grammyjs/types';
import { AlertType } from '.';

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
    public from?: User,
    public chatId?: number,
    public name?: string,
    public image?: string
  ) {}
}

export interface TokenMapId {
  id: string;
  symbol: string;
}

export interface SimplePriceResp {
  [tokenId: string]: {
    usd: number,  
    usd_market_cap?: number, 
    usd_24h_vol?: number,  
    usd_24h_change?: number, 
    last_updated_at?: number,  
  }
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
 { id: 'bitcoin', symbol: 'btc' },
 { id: 'ethereum', symbol: 'eth' },
 { id: 'pulsechain', symbol: 'pls' },
 { id: 'cardano', symbol: 'ada' },
 { id: 'solana', symbol: 'sol' },
 { id: 'vechain', symbol: 'vet' },
 { id: 'gala', symbol: 'gala' },
 { id: 'ripple', symbol: 'xrp' },
 { id: 'polygon-ecosystem-token', symbol: 'pol' },
 { id: 'polygon-ecosystem-token', symbol: 'matic' },
 { id: 'stellar', symbol: 'xlm' },
 { id: 'dogecoin', symbol: 'doge' },
 { id: 'hex', symbol: 'ehex' },
 { id: 'hex-pulsechain', symbol: 'hex' },
 { id: 'the-sandbox', symbol: 'sand' },
 { id: 'crypto-com-chain', symbol: 'cro' },
 { id: 'kaspa', symbol: 'kas' },
];

