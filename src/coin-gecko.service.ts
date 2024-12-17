import * as https from 'https';
import { CoinMarketDataResp, SimplePriceResp } from './models';
import { ClientRequest } from 'http';

export class CoinGeckoService {

  private _options;

  constructor(apiKey: string) {
    this._options = {
      method: 'GET',
      hostname: 'api.coingecko.com',
      port: null,
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': apiKey
      }
    };
  }


  getSimplePrice(tokenIds: string[], success: (res: SimplePriceResp) => void) {
    const req = https.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd&include_market_cap=true`,
      this._options, res => {
        const chunks: any = [];
        res
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const body = Buffer.concat(chunks);
          if ( body && JSON.parse(body.toString()) ) {
            success(JSON.parse(body.toString()));
          }
        })
        .on('error', err => {
          console.error('API ERROR', err);
        })
      });
    req.end();
  }
  
  getCoinMarketData(tokenIds: string[], success: (res: CoinMarketDataResp[]) => void) {
    const req = https.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds}`,
      this._options, res => {
        const chunks: any = [];
        res
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const body = Buffer.concat(chunks);
          if ( body && JSON.parse(body.toString()) ) {
            success(JSON.parse(body.toString()));
          }
        })
        .on('error', err => {
          console.error('API ERROR', err);
        })
      });
    req.end();
  }

}