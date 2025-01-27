import { Bot, Context, InputFile } from 'grammy';
import { AlertPool, BotActions, CoinMarketDataResp, GasOracleResponse, InfoType, PriceAlert, tokenMapIds} from './models';
import * as fs from 'fs';
import { ApiService } from './api.service';
import { AlertType } from './models';
import { formattedPrice } from './utilities';
import { RedisDb } from './rediscloud';

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
    private _apiService: ApiService,
    private _dbClient: RedisDb
  ) {
    this.init();
  }

  onSetPriceAlert(command: AlertType.PRICE_ABOVE | AlertType.PRICE_BELOW) {
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
            .find(map => map.id === tokenSymbolOrId || map.symbols.includes(tokenSymbolOrId))?.id; // || tokenSymbolOrId;
          }

          if ( tokenId ) {
            // check if an alert for a specific token already exist by a specific user
            const existingAlert = this._alerts.priceAlerts[tokenId]?.alerts
              .find(alert => alert.from?.id === ctx.from?.id && alert.type === command && alert.chatId === ctx.chatId && alert.type === command);
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
              this._dbClient.storeAlert(this._alerts);
              // fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(this._alerts));
            } catch (err) {
              console.error(err);
            }
            
            if ( tokenId === this._GWEI_ID ) {
              ctx.reply(`*${tokenId.toLocaleUpperCase()}* alert is set for a value ${command} ${targetPrice.toFixed(2)}`, { parse_mode: 'Markdown' });
            } else {
              ctx.reply(`*${tokenSymbolOrId.toLocaleUpperCase()}* alert is set for a price ${command} ${formattedPrice(targetPrice)}`, { parse_mode: 'Markdown' });
            }
          }
        } else {
          ctx.reply(`Wrong alert format. Eg.: /above btc 65000, or /below cardano 1.25`);
        }
      }
    });
  }

  onRemoveAlert() {
    this.bot.command(AlertType.REMOVE_ALERT, async (ctx) => {
      const message = ctx.message
      const args = message?.text?.split(/\s+/ig);
      if ( args && args.length >= 2 ) {
        const alertPool = await this._dbClient.getAlertPool();
        args.slice(1).forEach(tokenId => {
          const id = this.getTokenId(tokenId);
          if ( id && alertPool.priceAlerts[id]) {
            const alerts = alertPool.priceAlerts[id].alerts;
            for ( let i=0; i<alerts.length; ) {
              if ( alerts[0].chatId === ctx.chatId && alerts[0].from?.id === ctx.from?.id) {
                const alert = alerts.splice(i, 1);
                if ( alert[0] ) {
                  ctx.reply(`Removed ${alert[0].messageText}`);
                }
              } else {
                i++;
              }
            }
          }
        });
        this._dbClient.storeAlert(alertPool);
      }
    });
  }

  async onCheckPrices() {
    try {
      // const alertPool: AlertPool = JSON.parse(fs.readFileSync(this.alertPoolFilePath, 'utf8'));
      const alertPool: AlertPool = await this._dbClient.getAlertPool();
      if ( alertPool && alertPool.priceAlerts && Object.keys(alertPool.priceAlerts).length ) {
        let anyAlert = false;
        for ( let tokenAlert of Object.values(alertPool.priceAlerts) ) {
          if ( tokenAlert.alerts.length ) {
            anyAlert = true;
            break;
          }
        }
        if ( anyAlert ) {
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
                this._dbClient.storeAlert(alertPool);
                // fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(alertPool));
                this._alerts = alertPool;
              } catch (err) {
                console.error('WRITE ALERTS_POOL AFTER CHECKING PRICEs');
                console.error(err);
              }
            }
          });
        }
        if ( alertPool.priceAlerts[this._GWEI_ID]?.alerts.length > 0 ) {
          this._apiService.getEthGasOracle((res: GasOracleResponse) => {
            if ( res.message === 'OK' ) {
              for (let i=0; i < alertPool.priceAlerts[this._GWEI_ID].alerts.length;) {
                const gotTriggered = this.replyPriceAlert(Number(res.result.ProposeGasPrice), alertPool.priceAlerts[this._GWEI_ID].alerts[i]);
                if ( gotTriggered ) {
                  alertPool.priceAlerts[this._GWEI_ID].alerts.splice(i, 1);
                } else {
                  i++;
                }
              }
              this._dbClient.storeAlert(alertPool);
              // fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(alertPool));
              this._alerts = alertPool;
            }
          });
        }
      }
    } catch( err ) {
      console.error(err);
    }
  }

  onListAlerts() {
    this.bot.command('alerts', async (ctx) => {
      // const alertPool: AlertPool = JSON.parse(fs.readFileSync(this.alertPoolFilePath, 'utf8'));
      const alertPool: AlertPool = await this._dbClient.getAlertPool();
      let reply = '*List Alerts*\n';
      Object.entries(alertPool.priceAlerts).forEach(entry => {
        for (const alert of entry[1].alerts) {
          if ( alert.chatId === ctx.chatId ) {
            if ( alert.tokenId === this._GWEI_ID ) {
              reply += `• *Gwei* `;
              reply += `${alert.type} `;
              reply += `${alert.targetPrice}\n`;
            } else {
              reply += `• *${this.getTokenSymbolFromId(entry[0], alert.tokenId)}* `;
              reply += `${alert.type} `;
              reply += `${formattedPrice(alert.targetPrice)}\n`;
            }
          }
        }
      })
      ctx.reply(reply, { parse_mode: 'Markdown' });
    });
  }

  onListAlertFile() {
    this.bot.command('alerts__', async (ctx) => {
      // ctx.replyWithDocument(new InputFile('./alert_pool.json'),
      const alerts = await this._dbClient.getAlertPool();
      const buffer = Buffer.from(JSON.stringify(alerts), 'utf-8');
      ctx.replyWithDocument(
        new InputFile(buffer, './alert_pool.json'), 
        {
          caption: 'Here is the current state of alert_pool.json.',
        }
      );
    });
  }

  onDeepSeek() {
    this.bot.command('ds', async (ctx) => {
      // restrictions: only for Investing4us, and Fulvio
      if ( ctx.chat.id === -1001605797101 || ctx.from?.id === 51914389 ) {
        if ( ctx.message?.text ) {
          const query = ctx.message.text.split(/\/ds\s+/i)[1];
          ctx.api.sendChatAction(ctx.chat!.id, BotActions.TYPING);
          this._apiService.getDeepSeekRes(query)
          .then(res => {
            console.log(res.choices);
            if ( res.choices.length && res.choices[0].message.content ) {
              const answerContent = res.choices.reduce((prev, curr) => `${prev}\n${curr.message.content}\n\n`, '');
              this.bot.api.sendMessage(ctx.chatId, answerContent, { parse_mode: 'HTML' } );
            } else {
              ctx.reply('Try again');
            }
          });
        }
      }
    });
  }

  private async init() {
    this._alerts = await this._dbClient.getAlertPool();
    // try {
      // const fileContent = fs.readFileSync(this._alertPoolFilePath, 'utf8');
      // if ( JSON.parse(fileContent) ) {
      //   this._alerts = JSON.parse(fileContent);
      //   const tokenIds = Object.keys(this._alerts.priceAlerts);
      //   if ( tokenIds.length ) {
      //     this._tokenIdsAlert = tokenIds;
      //   }
      // } else {
      //   this._alerts = { priceAlerts: { }}
      // }
    // } catch( err ) {
    //   this._alerts = { priceAlerts: { }};
      // try {
      //   fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(this._alerts));
      // } catch (err) {
      //   console.error(err);
      // }
    // }
  }

  private replyPriceAlert(
    currentPrice: number,
    priceAlert: PriceAlert
  ): boolean {
    if ( priceAlert.type === AlertType.PRICE_ABOVE && currentPrice > priceAlert.targetPrice 
      || priceAlert.type === AlertType.PRICE_BELOW && currentPrice < priceAlert.targetPrice ) {
      const tokenTitle = this.getTokenSymbolFromId(priceAlert.tokenId, priceAlert.tokenId);
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

  private getTokenSymbolFromId(id: string, alertTokenId: string) {
    return tokenMapIds.find(tm => tm.id === id)?.symbols[0].toUpperCase() || alertTokenId;
  }
  
  private getTokenId(tokenId: string): string | undefined {
    return [InfoType.GWEI, 'gas'].includes(tokenId) ? InfoType.GWEI : tokenMapIds.find(tm => tm.id === tokenId || tm.symbols.indexOf(tokenId) > -1 )?.id;
  }

}