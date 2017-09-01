const Discord = require('discord.js');
const Command = require('../command.js');

class Info extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			description: 'Displays detailed information about a coin.',
			use: [
				['<symbol>', true]
			],
			example: '*info BTC* - Displays info about Bitcoin',
			aliases: [
				'details'
			],
			permissions: [],
			ownerOnly: false
		});
	}

	run(msg, args) {
		if (!args[0]) return msg.reply('Please provide a currency name');
		if (!this.client.tickers.has(args[0].toUpperCase())) return msg.reply('Invalid currency symbol');
		let t = this.client.tickers.get(args[0].toUpperCase());
		let emb = new Discord.RichEmbed()
			.setTitle(`:clipboard: Coin Info For: ${t.name} (${t.symbol})`)
			.setTimestamp()
			.addField('Price BTC', `${t.price_btc} BTC`, true)
			.addField('Price USD', `$${t.price_usd}`, true)
			.addBlankField(true)
			.addField('24h Change', t.percent_change_24h > 0 ? '+' + t.percent_change_24h + '%': t.percent_change_24h + '%', true) //eslint-disable-line
			.addField('7d Change', t.percent_change_7d > 0   ? '+' + t.percent_change_7d + '%' : t.percent_change_7d + '%', true) //eslint-disable-line
			.addBlankField(true)
			.addField('24h Volume (USD)', `$${t['24h_volume_usd']}`, true)
			.addField('Market Cap (USD)', `$${t.market_cap_usd}`, true)
			.addField('Available Supply', `${t.available_supply} ${t.symbol}`, true);
		msg.channel.send({ embed: emb });
	}
}

module.exports = Info;
