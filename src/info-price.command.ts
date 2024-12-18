import { Bot, Context } from 'grammy';
import { CoinGeckoService } from './coin-gecko.service';
import { tokenMapIds, InfoType } from './models';
import { formattedPrice, trunkPrice } from './utilities';

export class InfoPriceCommand {

  constructor(
    private bot: Bot<Context>,
    private _coinGeckoService: CoinGeckoService
  ) {}

  onTokenPrice() {
    this.bot.command(InfoType.INFO, async (ctx) => {
      if ( ctx.message ) {
        const idsFromMessage: string[] = ctx.message.text.split(/\s+/).slice(1);
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
          this._coinGeckoService.getCoinMarketData(idsToGetInfoFrom, (resp) => {
            let replyFormatted = '';
            if ( resp.length ) {
              resp.forEach(coin => {
                replyFormatted += `• *${coin.name}* at ${formattedPrice(coin.current_price)} - *MC* ${trunkPrice(coin.market_cap)}\n\n`;
              });
              ctx.reply(replyFormatted, { parse_mode: 'Markdown' });
            }
          });
        } else {
          if ( idsFromMessage.length === 1 ) {
            ctx.reply(`@${ctx.from.username || ctx.from.first_name} *${idsFromMessage[0]}* is not found`, { parse_mode: 'Markdown' });
          } else {
            ctx.reply(`@${ctx.from.username || ctx.from.first_name} none of the coins are found`);
          }
        }
      }
    });
  }

  onGasPrice() {
    
  }

}