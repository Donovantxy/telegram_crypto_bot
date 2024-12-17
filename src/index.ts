import { Bot, Context, webhookCallback } from 'grammy';
import * as dotenv from 'dotenv';
import { Alert } from './alert';
import { CoinGeckoService } from './coin-gecko.service';
import { InfoPrice } from './info-price';
import express from 'express';

dotenv.config();

export enum AlertType {
  PRICE_ABOVE = 'above',
  PRICE_BELOW = 'below',
  GAS_PRICE = 'gas',
  GAS_BELOW = 'gas_below',
}

export enum InfoType {
  INFO = 'info',
}

const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN as string);
const POLLING_TIME_IN_SEC = 5;
const apiService = new CoinGeckoService(process.env.COINGECKO_API_KEY as string);
const alert = new Alert(bot, apiService);
const info = new InfoPrice(bot, apiService);

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
  // alert.checkPricesAndReply();
}, POLLING_TIME_IN_SEC * 1000); 

// bot.start();

const app = express();
app.use(express.json());
app.use(webhookCallback(bot, 'express'));
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
