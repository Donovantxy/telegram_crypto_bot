import { Bot, Context } from 'grammy';
import { ApiService } from './api.service';
import { tokenMapIds, InfoType, GasOracleResponse } from './models';
import { formattedPrice, trunkPrice } from './utilities';

export class InfoPriceCommand {

  constructor(
    private bot: Bot<Context>,
    private _apiService: ApiService
  ) {}

  onTokenPrice() {
    this.bot.command(InfoType.INFO, async (ctx) => {
      if ( ctx.message ) {
        const idsFromMessage: string[] = ctx.message.text.split(/\s+/).slice(1).map(id => id.toLocaleLowerCase());
        const idsToGetInfoFrom: string[] = [];
        idsFromMessage.forEach(textId => {
          const matchedId = tokenMapIds.find(mapId => mapId.id === textId || mapId.symbols.includes(textId))
          if ( matchedId ) {
            idsToGetInfoFrom.push(matchedId.id);
          } else {
            idsToGetInfoFrom.push(textId);
          }
        });
        if ( idsToGetInfoFrom.length ) {
          this._apiService.getCoinMarketData(idsToGetInfoFrom, (resp) => {
            let replyFormatted = '';
            if ( resp.length ) {
              resp.forEach(coin => {
                replyFormatted += `• *${coin.name}* at ${formattedPrice(coin.current_price)} (${coin.price_change_percentage_24h.toFixed(2)}%) - *MC* ${trunkPrice(coin.market_cap)}\n`;
              });
              ctx.reply(replyFormatted, { parse_mode: 'Markdown' });
            }
          });
        } else {
          if ( idsFromMessage.length === 1 ) {
            ctx.reply(`*${idsFromMessage[0]}* is not found`, { parse_mode: 'Markdown' });
          } else {
            ctx.reply(`none of the coins are found`);
          }
        }
      }
    });
  }

  onGweiValue() {
    this.bot.command(InfoType.GWEI, async (ctx) => {
      this._apiService.getEthGasOracle((res: GasOracleResponse) => {
        if ( res.message === 'OK' ) {
          let replyFormatted = '*Ethereum Gwei scan*\n';
          replyFormatted += `*Low* ${Number(res.result.SafeGasPrice).toFixed(2)}\n`;
          replyFormatted += `*Mid* ${Number(res.result.ProposeGasPrice).toFixed(2)}\n`;
          replyFormatted += `*High* ${Number(res.result.FastGasPrice).toFixed(2)}\n`;
          ctx.reply(replyFormatted, { parse_mode: 'Markdown' });
        }
      });
    });
  }

}
