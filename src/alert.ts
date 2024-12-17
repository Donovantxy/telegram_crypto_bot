import { Bot, Context } from 'grammy';
import { AlertPool, PriceAlert, SimplePriceResp, tokenMapIds} from './models';
import * as fs from 'fs';
import { CoinGeckoService } from './coin-gecko.service';
import { AlertType } from '.';

export class Alert {
  
  get alertPoolFilePath(): string {
    return this._alertPoolFilePath;
  }
  
  get tokenIdsAlert(): string[] {
    return this._tokenIdsAlert;
  }

  private _alerts!: AlertPool;
  private _alertPoolFilePath = './src/alert_pool.json';
  private _tokenIdsAlert: string[] = [];
  

  constructor(
    private bot: Bot<Context>,
    private _coinGeckoService: CoinGeckoService
  ) {
    this.init();
  }

  setPriceAlert(command: AlertType) {
    this.bot.command(command, async (ctx) => {
      const message = ctx.message
      const args = message?.text?.split(/\s+/ig);
      if ( args && args.length >= 2 ) {
        const tokenSymbolOrId = /[a-z]{2,10}/i.test(args[1]) ? args[1].toLowerCase() : undefined;
        const targetPrice = Number(/\d{1,10}(\.\d{1,8})?/i.test(args[2]) ? args[2] : undefined);
        if ( tokenSymbolOrId && targetPrice && this._alerts.priceAlerts) {
          const tokenId = tokenMapIds
          .find(map => map.id === tokenSymbolOrId || map.symbol === tokenSymbolOrId)?.id || tokenSymbolOrId;
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
                ctx.from,
                ctx.chatId,
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

          // ctx.reply(`@${ctx.from?.username}`);
          ctx.reply(`${tokenSymbolOrId} alert is set for a price ${command} $${targetPrice}`);
        } else {
          ctx.reply(`Wrong alert format. Eg.: /above btc 65000, or /below cardano 1.25`);
        }
      }
    });
  }

  checkPricesAndReply() {
    // this.bot.api.sendMessage()
    try {
      const alertPoolFile: AlertPool = JSON.parse(fs.readFileSync(this.alertPoolFilePath, 'utf8'));
      if ( alertPoolFile && alertPoolFile.priceAlerts && Object.keys(alertPoolFile.priceAlerts).length ) {
        this._coinGeckoService.getSimplePrice(Object.keys(alertPoolFile.priceAlerts), (res: SimplePriceResp) => {
          console.log(111, res);
        });
        // console.log('%cTokenList', 'color:yellow;font-size:16px', Object.keys(alertPoolFile.priceAlerts));
        // console.log('%cALERTS POOL\n', 'color:blue;font-size:16px', alertPoolFile);
      }
    } catch( err ) {
      console.error(err);
    }
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
      console.error(err);
      this._alerts = { priceAlerts: { }};
      try {
        fs.writeFileSync(this._alertPoolFilePath, JSON.stringify(this._alerts));
      } catch (err) {
        console.error(err);
      }
    }
  }

}