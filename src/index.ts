import { Bot, Context, webhookCallback } from 'grammy';
import * as dotenv from 'dotenv';
import { Alert } from './alert';
import { CoinGeckoService } from './coin-gecko.service';
import { InfoPrice } from './info-price';
import { AlertType } from './models';

dotenv.config();

const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN as string);

const POLLING_TIME_IN_SEC = 5;
const apiService = new CoinGeckoService(process.env.COINGECKO_API_KEY as string);
const alert = new Alert(bot, apiService);
const info = new InfoPrice(bot, apiService);

bot.command('help', (ctx) => {

  ctx.reply(
`
*Command List*
/info btc sol ada - prints the price, and market cap for the listed tokens
/above (or below) - sets an alert which gets triggered whenever that condition is met\n
*Links*
**[Pulsechain](https://www.pulsechain.com/)**
**[Hex](https://hex.com/links)**
**[Ethereum Gas tracker](https://etherscan.io/gastracker)**
**[CoinMarketCap](https://coinmarketcap.com/charts/)**
`,
{ parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });

});
alert.setPriceAlert(AlertType.PRICE_ABOVE);
alert.setPriceAlert(AlertType.PRICE_BELOW);
info.getInfoAndReply();

// bot.on('message', async (ctx) => {
//   const countMember = await ctx.getChatMemberCount();
//   console.log(countMember, ctx.chat, ctx.chatId);
//   if ( ctx.chat.type === 'supergroup' ) {
//     if ( (ctx.message.text || '').includes(process.env.BOT_USERNAME!) ) {
//       ctx.reply(`Hello, I'm running...`);
//       ctx.reply(`Just for you to know, ${ctx.message.from.username}`);
//     }
//   }
// });

setInterval(async () => {
  alert.checkPricesAndReply();
}, POLLING_TIME_IN_SEC * 1000); 

bot.start();
console.log('Bot is running...');
