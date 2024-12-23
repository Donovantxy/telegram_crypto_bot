import * as https from 'https';
import { CoinMarketDataResp, GasOracleResponse, SimplePriceResp } from './models';

export class ApiService {

  private _options;
  private _optionsEth;

  constructor(private _apiKey: string, private _etherScanApiKey: string) {
    this._options = {
      method: 'GET',
      hostname: 'api.coingecko.com',
      port: null,
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': this._apiKey
      }
    };
    
    this._optionsEth = {
      method: 'GET',
      port: null,
      headers: {
        accept: 'application/json',
      }
    };
  }


  // getSimplePrice(tokenIds: string[], success: (res: SimplePriceResp) => void) {
  //   const req = https.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd&include_market_cap=true`,
  //     this._options, res => {
  //       const chunks: any = [];
  //       res
  //       .on('data', (chunk) => {
  //         chunks.push(chunk);
  //       })
  //       .on('end', () => {
  //         const body = Buffer.concat(chunks);
  //         if ( body && JSON.parse(body.toString()) ) {
  //           success(JSON.parse(body.toString()));
  //         }
  //       })
  //       .on('error', err => {
  //         console.error('API ERROR', err);
  //       })
  //     });
  //   req.end();
  // }
  
  getCoinMarketData(tokenIds: string[], success: (res: CoinMarketDataResp[]) => void) {
    const req = https.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}`,
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

  getEthGasOracle(success: (res: GasOracleResponse) => void) {
    const req = https.get(`https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${this._etherScanApiKey}`,
      this._optionsEth, res => {
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
          console.error('Etherscan API ERROR', err);
        })
      });
    req.end();
  }

}