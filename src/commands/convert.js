/* eslint-disable max-len, consistent-return */
const Command = require('../command.js');

class Convert extends Command {
	constructor(client) {
		super(client, {
			name: 'convert',
			description: 'Converts one cryptocurrency to another',
			use: [
				['<symbol>', true],
				['<amount>', true],
				['<symbol2> - defaults to USD', false]
			],
			example: '*convert BTC 1* - Convert 1 BTC to USD\n\t*convert BTC 1 ETH* - Convert 1 BTC to ETH',
			aliases: [
				'c',
				'calculate'
			],
			permissions: [],
			ownerOnly: false
		});
	}

	run(msg, args) {
		const symbol1 = args[0].toUpperCase();
		const amount = args[1];
		let symbol2;
		if (args[2]) symbol2 = args[2].toUpperCase();
		if (!this.client.tickers.has(symbol1)) return msg.reply(`Invalid cryptocurrency symbol: ${symbol1}`);
		if (symbol2) {
			if (!this.client.tickers.has(symbol2)) return msg.reply(`Invalid cryptocurrency symbol: ${symbol2}`);
			let numOther = (amount * this.client.tickers.get(symbol1).price_btc) / this.client.tickers.get(symbol2).price_btc; // eslint-disable-line max-len
			msg.channel.send(`${numOther} ${symbol2}`);
		} else {
			msg.channel.send(`$${this.client.tickers.get(symbol1).price_usd * amount}`);
		}
	}
}

module.exports = Convert;
