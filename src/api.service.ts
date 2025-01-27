import * as https from 'https';
import { CoinMarketDataResp, GasOracleResponse, SimplePriceResp } from './models';
import OpenAI from "openai";

export class ApiService {

  private _options;
  private _optionsEth;

  constructor(
    private _apiKey: string,
    private _etherScanApiKey: string,
    private _deepSeekApiKey: string
  ) {
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

  // async getDeepSeekRes(question: string): APIPromise<OpenAI.Chat.Completions.ChatCompletion>  {
  async getDeepSeekRes(question: string): Promise<OpenAI.Chat.Completions.ChatCompletion>  {
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: this._deepSeekApiKey
    });

    const systemContent = `
      You are CryptoAlpha, a professional cryptocurrency analyst bot. Your goal is to:
      1. Provide accurate crypto price data (when given context), market trends, and technical analysis.
      2. Explain price movements using indicators like RSI, MACD, or Bollinger Bands.
      3. Offer short/long-term forecasts based on historical patterns (with clear disclaimers).
      4. Support top 50 cryptocurrencies (e.g., BTC, ETH, SOL, XRP).
      5. Use Telegram-friendly formatting (bullet points, emojis, concise tables).

      Rules:
      - Allowed to provide financial advice but always include "This is not financial advice."
      - If data is outdated, say "As of [date], [coin] was priced at [price]."
      - For unknown coins: either print "I don't have data for [coin]. Try BTC, ETH, etc." or look crawl on web.
      - Use 📈📉🔥💎🚀 emojis for market sentiment.
      `;

    return openai.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: question }
      ],
      model: "deepseek-chat",
    })
  }

}