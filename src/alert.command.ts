import { Bot, Context } from 'grammy';
import { AlertPool, CoinMarketDataResp, GasOracleResponse, PriceAlert, tokenMapIds} from './models';
import * as fs from 'fs';
import { ApiService } from './api.service';
import { AlertType } from './models';
import { formattedPrice } from './utilities';

export class AlertCommand {
  
  get alertPoolFilePath(): string {
    return this._alertPoolFilePath;
  }
  
  get tokenIdsAlert(): string[] {
    return this._tokenIdsAlert;
  }

  private _alerts!: AlertPool;
  private _alertPoolFilePath = './alert_pool.json';
  private _tokenIdsAlert: string[] = [];
  private _GWEI_ID = 'gwei';
  

  constructor(
    private bot: Bot<Context>,
    private _apiService: ApiService
  ) {
    this.init();
  }

  onSetPriceAlert(command: AlertType) {
    this.bot.command(command, async (ctx) => {
      const message = ctx.message
      const args = message?.text?.split(/\s+/ig);
      if ( args && args.length >= 2 ) {
        const tokenSymbolOrId = /[a-z]{2,10}/i.test(args[1]) ? args[1].toLowerCase() : undefined;
        const targetPrice = Number(/\d{1,10}(\.\d{1,8})?/i.test(args[2]) ? args[2] : undefined);
        if ( tokenSymbolOrId && targetPrice && this._alerts.priceAlerts) {
          let tokenId;
          if ( tokenSymbolOrId === 'gas' || tokenSymbolOrId === 'gwei' ) {
            tokenId = this._GWEI_ID;
          } else {
            tokenId = tokenMapIds
            .find(map => map.id === tokenSymbolOrId || map.symbols.includes(tokenSymbolOrId))?.id || tokenSymbolOrId;
          }
          // check if an alert for a specific token already exist by a specific user
          const existingAlert = this._alerts.priceAlerts[tokenId]?.alerts
            .find(alert => alert.from?.id === ctx.from?.id && alert.type === command && alert.chatId === ctx.chatId);
          if ( !existingAlert ) {
            if ( !this._alerts.priceAlerts[tokenId] ) {
              Object.assign(this._alerts.priceAlerts, {[tokenId]: {alerts: []}})
            }
            this._alerts.priceAlerts[tokenId].alerts
              .push(new PriceAlert(
                command,
                message?.text,
                tokenId,
                targetPrice,
                ctx.chatId,
                ctx.from,
              ));
          } else {
            existingAlert.messageText = message?.text ?? '';
            existingAlert.tokenId = tokenId;
            existingAlert.targetPrice = targetPrice;
          }
        
          try {
            fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(this._alerts));
          } catch (err) {
            console.error(err);
          }
          
          if ( tokenId === this._GWEI_ID ) {
            ctx.reply(`*${tokenId.toLocaleUpperCase()}* alert is set for a value ${command} ${targetPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
          } else {
            ctx.reply(`*${tokenSymbolOrId.toLocaleUpperCase()}* alert is set for a price ${command} ${formattedPrice(targetPrice)}`, { parse_mode: 'Markdown' });
          }
        } else {
          ctx.reply(`Wrong alert format. Eg.: /above btc 65000, or /below cardano 1.25`);
        }
      }
    });
  }

  onCheckPrices() {
    try {
      const alertPool: AlertPool = JSON.parse(fs.readFileSync(this.alertPoolFilePath, 'utf8'));
      if ( alertPool && alertPool.priceAlerts && Object.keys(alertPool.priceAlerts).length ) {
        let anyAlert = false;
        for ( let tokenAlert of Object.values(alertPool.priceAlerts) ) {
          if ( tokenAlert.alerts.length ) {
            anyAlert = true;
            break;
          }
        }
        if ( anyAlert ) {
          // this._apiService.getSimplePrice(Object.keys(alertPool.priceAlerts), (prices: SimplePriceResp) => {
          this._apiService.getCoinMarketData(Object.keys(alertPool.priceAlerts), (prices: CoinMarketDataResp[]) => {
            if ( prices.length ) {
              const tokenKey = Object.keys(alertPool.priceAlerts);
              for ( const price of prices ) {
                if ( alertPool.priceAlerts[price.id] ) {
                  for (let i=0; i<alertPool.priceAlerts[price.id].alerts.length;) {
                    const gotTriggered = this.replyPriceAlert(price.current_price, alertPool.priceAlerts[price.id].alerts[i]);
                    if ( gotTriggered ) {
                      alertPool.priceAlerts[price.id].alerts.splice(i, 1);
                      if ( alertPool.priceAlerts[price.id].alerts.length === 0 ) {
                        break;
                      }
                    } else {
                      i++;
                    }
                  }
                }
              }
              try {
                fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(alertPool));
              } catch (err) {
                console.error('WRITE ALERTS_POOL AFTER CHECKING PRICEs');
                console.error(err);
              }
            }
            // if ( Object.keys(prices).length ) {
            //   for ( const tokenKey of Object.keys(prices) ) {
            //     if ( alertPool.priceAlerts[tokenKey] ) {
            //       for (let i=0; i<alertPool.priceAlerts[tokenKey].alerts.length;) {
            //         const gotTriggered = this.replyPriceAlert(prices[tokenKey].usd, alertPool.priceAlerts[tokenKey].alerts[i]);
            //         if ( gotTriggered ) {
            //           alertPool.priceAlerts[tokenKey].alerts.splice(i, 1);
            //           if ( alertPool.priceAlerts[tokenKey].alerts.length === 0 ) {
            //             break;
            //           }
            //         } else {
            //           i++;
            //         }
            //       }
            //     }
            //   }
            //   try {
            //     console.log('write file', alertPool);
            //     fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(alertPool));
            //   } catch ( err ) {
            //     console.error('WRITE ALERTS_POOL AFTER CHECKING PRICEs');
            //     console.error(err);
            //   }
            // }
          });
        }
        if ( alertPool.priceAlerts[this._GWEI_ID]?.alerts.length > 0 ) {
          this._apiService.getEthGasOracle((res: GasOracleResponse) => {
            if ( res.message === 'OK' ) {
              for (let i=0; i < alertPool.priceAlerts[this._GWEI_ID].alerts.length; i++) {
                const gotTriggered = this.replyPriceAlert(Number(res.result.ProposeGasPrice), alertPool.priceAlerts[this._GWEI_ID].alerts[i]);
                if ( gotTriggered ) {
                  alertPool.priceAlerts[this._GWEI_ID].alerts.splice(i, 1);
                }
              }
              fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(alertPool));
            }
          });
        }
      }
    } catch( err ) {
      console.error(err);
    }
  }

  onListAlerts() {
    this.bot.command('alerts', (ctx) => {
      const alertPool: AlertPool = JSON.parse(fs.readFileSync(this.alertPoolFilePath, 'utf8'));
      let reply = '*List Alerts*\n';
      Object.entries(alertPool.priceAlerts).forEach(entry => {
        for (const alert of entry[1].alerts) {
          if ( alert.chatId === ctx.chatId ) {
            if ( alert.tokenId === this._GWEI_ID ) {
              reply += `• *Gwei* `;
              reply += `${alert.type} `;
              reply += `${alert.targetPrice}\n`;
            } else {
              reply += `• *${tokenMapIds.find(tm => tm.id === entry[0])?.symbols[0].toUpperCase() || alert.tokenId}* `;
              reply += `${alert.type} `;
              reply += `${formattedPrice(alert.targetPrice)}\n`;
            }
          }
        }
      })
      ctx.reply(reply, { parse_mode: 'Markdown' });
    });
  }

  private init() {
    try {
      const fileContent = fs.readFileSync(this._alertPoolFilePath, 'utf8');
      if ( JSON.parse(fileContent) ) {
        this._alerts = JSON.parse(fileContent);
        const tokenIds = Object.keys(this._alerts.priceAlerts);
        if ( tokenIds.length ) {
          this._tokenIdsAlert = tokenIds;
        }
      } else {
        this._alerts = { priceAlerts: { }}
      }
    } catch( err ) {
      this._alerts = { priceAlerts: { }};
      try {
        fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(this._alerts));
      } catch (err) {
        console.error(err);
      }
    }
  }

  private storeAlert() {

  }

  private replyPriceAlert(
    currentPrice: number,
    priceAlert: PriceAlert
  ): boolean {
    if ( priceAlert.type === AlertType.PRICE_ABOVE && currentPrice > priceAlert.targetPrice 
      || priceAlert.type === AlertType.PRICE_BELOW && currentPrice < priceAlert.targetPrice ) {
      const tokenTitle = tokenMapIds.find(tokenMap => tokenMap.id === priceAlert.tokenId)?.symbols[0].toUpperCase() || priceAlert.tokenId;
      let msgTag = priceAlert.from ? `${priceAlert.from.username || priceAlert.from.first_name}\n` : '';
      let msg = `${msgTag}`
      if ( tokenTitle === this._GWEI_ID ) {
        msg += `*GWEI* is ${Number(currentPrice).toFixed(2)} - ${priceAlert.type} ${priceAlert.targetPrice}`;
      } else {
        msg += `*${tokenTitle}* price is ${formattedPrice(currentPrice)} - ${priceAlert.type} ${formattedPrice(priceAlert.targetPrice)}`;
      }
      this.bot.api.sendMessage( priceAlert.chatId!, msg, { parse_mode: 'Markdown' });
      return true;
    }
    return false;
  }

}