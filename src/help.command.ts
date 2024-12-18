import { Bot, Context } from 'grammy';

export class HelpCommand {
  
  constructor(
    private bot: Bot<Context>,
  ) {}

  onHelp() {
    this.bot.command('help', (ctx) => {
      ctx.reply(
        `
        *Command List*
        /info btc sol ada - prints the price, and market cap for the listed tokens
        /above (or below) - sets an alert which gets triggered whenever that condition is met
        /alerts - list of active alerts
        /help\n
        *Links*
        **[Pulsechain](https://www.pulsechain.com/)**
        **[Hex](https://hex.com/links)**
        **[Ethereum Gas tracker](https://etherscan.io/gastracker)**
        **[CoinMarketCap](https://coinmarketcap.com/charts/)**
        `,
        { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
    });
  }

}