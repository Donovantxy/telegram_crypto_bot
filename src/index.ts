import { Bot, Context, InputFile } from 'grammy';
import * as dotenv from 'dotenv';
import { AlertCommand } from './alert.command';
import { ApiService } from './api.service';
import { InfoPriceCommand } from './info-price.command';
import { AlertType } from './models';
import { HelpCommand } from './help.command';
import { RedisDb } from './rediscloud';

dotenv.config();

const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN as string);
const dbClient = new RedisDb(process.env.REDIS_DB_PW!, process.env.REDIS_DB_HOST!, Number(process.env.REDIS_DB_PORT));
dbClient.connect().then(() => {

  const POLLING_TIME_IN_SEC = 30;
  const apiService = new ApiService(
    process.env.COINGECKO_API_KEY as string,
    process.env.ETHERSCAN_API_KEY as string,
    process.env.DEEP_SEEK_API_KEY as string
  );
  const alert = new AlertCommand(bot, apiService, dbClient);
  const info = new InfoPriceCommand(bot, apiService);
  const helpCommand = new HelpCommand(bot);
  
  
  helpCommand.onHelp();
  alert.onListAlertFile();
  alert.onDeepSeek();
  alert.onSetPriceAlert(AlertType.PRICE_ABOVE);
  alert.onSetPriceAlert(AlertType.PRICE_BELOW);
  alert.onRemoveAlert();
  alert.onListAlerts();
  info.onTokenPrice();
  info.onGweiValue();
  
  // bot.on('message', async (ctx) => {
  //   const countMember = await ctx.getChatMemberCount();
  //   console.log(countMember, ctx.chat, ctx.chatId);
    // if ( ctx.chat.type === 'supergroup' && ) {
    //   if ( (ctx.message.text || '').includes(process.env.BOT_USERNAME!) ) {
    //     ctx.reply(`Hello, I'm running...`);
    //     ctx.reply(`Just for you to know, ${ctx.message.from.username}`);
    //   }
    // }
  // });
  
  setInterval(async () => {
    alert.onCheckPrices();
  }, POLLING_TIME_IN_SEC * 1000);
  
  bot.start();
  console.log('Bot is running...');

});

