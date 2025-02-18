import { Bot, Context } from 'grammy';

/*
Inline commands
alerts - list of active alerts
gwei - lists the current low, mid, and high gwei values
help - list of commands, and useful links
*/

export class HelpCommand {
  
  constructor(
    private bot: Bot<Context>,
  ) {}

  onHelp() {
    this.bot.command('help', (ctx) => {
      ctx.reply(
`*Command List*
/info btc sol ada - prints the price, 24h price change, and market cap for the listed tokens.
/above (or below) - sets an alert which gets triggered whenever that condition is met. For Ethereum gwei you can use either *gas* or *gwei*.
/remove - removes the alert(s) set by you on a specific chat/group.
/alerts - list of active alerts.
/gwei - lists the current low, mid, and high gwei values.
/ds - you can query DeepSeek on crypto market, price, and forecasts
/help\n
*Links*
**[Bitcoin mempool explorer](https://mempool.space/)
**[Pulsechain](https://www.pulsechain.com/)**
**[Hex](https://hex.com/links)**
**[Ethereum Gas tracker](https://etherscan.io/gastracker)**
**[CoinMarketCap](https://coinmarketcap.com/charts/)**`,
        { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
    });
  }

}