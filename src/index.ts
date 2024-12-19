import { Bot, Context, InputFile } from 'grammy';
import * as dotenv from 'dotenv';
import { AlertCommand } from './alert.command';
import { ApiService } from './api.service';
import { InfoPriceCommand } from './info-price.command';
import { AlertType, GasOracleResponse } from './models';
import { HelpCommand } from './help.command';

dotenv.config();

const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN as string);

const POLLING_TIME_IN_SEC = 15;
const apiService = new ApiService(
  process.env.COINGECKO_API_KEY as string,
  process.env.ETHERSCAN_API_KEY as string
);
const alert = new AlertCommand(bot, apiService);
const info = new InfoPriceCommand(bot, apiService);
const helpCommand = new HelpCommand(bot);


bot.command('alerts__', (ctx) => {
  ctx.replyWithDocument(
    new InputFile('./alert_pool.json'),
    {
      caption: 'Here is the current state of alert_pool.json.',
    });
});
helpCommand.onHelp();
alert.onSetPriceAlert(AlertType.PRICE_ABOVE);
alert.onSetPriceAlert(AlertType.PRICE_BELOW);
alert.onListAlerts();
info.onTokenPrice();
info.onGasPrice();

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
  alert.onCheckPrices();
}, POLLING_TIME_IN_SEC * 1000);

bot.start();
console.log('Bot is running...');
