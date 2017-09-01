const Discord = require('discord.js');
const Command = require('../command.js');

class Prices extends Command {
	constructor(client) {
		super(client, {
			name: 'prices',
			description: 'Displays info about a list of currencies configured by your server.',
			use: [],
			aliases: [
				'tickers'
			],
			permissions: [],
			ownerOnly: false
		});
	}

	run(msg, args, serverConfig) {
		this.client.updateAllTickers();
		let emb = new Discord.RichEmbed()
			.setTitle(':b:rypto:b:urrency :b:rices')
			.setTimestamp();
		for (let symbol of serverConfig.currencies) {
			const t = this.client.tickers.get(symbol.toUpperCase());
			let chg1D = t.percent_change_24h;
			if (chg1D >= 0) chg1D = `+${chg1D}`;

			chg1D += '%';
			emb.addField(`${t.symbol} (${t.name})`, `[24 Hour Change${chg1D}](${this.client.config.prettyTickerUrlBase}${t.id}/)`, true)
				.addField('Price USD:', `$${t.price_usd}`, true)
				.addField('Price BTC:', t.price_btc, true);
		}
		msg.channel.send({ embed: emb });
	}
}

module.exports = Prices;
