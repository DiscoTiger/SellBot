const Discord = require('discord.js');
const client = new Discord.Client();
const snekfetch = require('snekfetch');
const schedule = require('node-schedule');

const cmdPrefix = '$';
const tickerURLs = [
	'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
	'https://api.coinmarketcap.com/v1/ticker/zcash/',
	'https://api.coinmarketcap.com/v1/ticker/ethereum/',
	'https://api.coinmarketcap.com/v1/ticker/monero/',
	'https://api.coinmarketcap.com/v1/ticker/ethereum-classic/',
	'https://api.coinmarketcap.com/v1/ticker/library-credit/'
];
const prettyURLs = [
	'https://www.coinmarketcap.com/currencies/bitcoin/',
	'https://www.coinmarketcap.com/currencies/zcash/',
	'https://www.coinmarketcap.com/currencies/ethereum/',
	'https://www.coinmarketcap.com/currencies/monero/',
	'https://www.coinmarketcap.com/currencies/ethereum-classic/',
	'https://www.coinmarketcap.com/currencies/library-credit/'
];

var boundChannel;

function cmd(m, text) {
	return m.content.toLowerCase().startsWith(cmdPrefix + text);
}

async function getTickers(callback) {
	let list = [];
	for (let i in tickerURLs) {
		let tmp = await snekfetch.get(tickerURLs[i]).then(r => r.text);
		tmp = JSON.parse(tmp)[0];
		list.push(tmp);
	}
	callback(list);
}

function createEmbed(tickers) {
	let emb = new Discord.RichEmbed()
    .setTitle(':b:rypto:b:urrency :b:rices')
    .setTimestamp();
	for (let i in tickers) {
		let t = tickers[i];
		let chg1D = t.percent_change_24h;
		if (chg1D >= 0) {
			chg1D = `+${ chg1D}`;
		}
		chg1D += '%';
		emb.addField(t.symbol, `[24 Hour Change${chg1D}](${prettyURLs[i]})`, true)
            .addField('Price USD:', `$${t.price_usd}`, true)
            .addField('Price BTC:', t.price_btc, true);
	}
	return emb;
}

client.on('ready', async () => {
	boundChannel = client.guilds.first().defaultChannel;
	var rule = new schedule.RecurrenceRule();
	rule.hour = [7, 11, 17];
	rule.minute = 0;
	var job = schedule.scheduleJob(rule, () => {
		getTickers(tickers => {
			boundChannel.send({ embed: createEmbed(tickers) });
		});
	});
	client.user.setGame('coinmarketcap.com');
	console.log(`${'[INFO]'.cyan } SellBot Online!`);
});

client.on('message', async message => {
	if (message.author.bot) return;

	if (cmd(message, 'prices') || cmd(message, 'brices')) {
		getTickers(tickers => {
			message.channel.send({ embed: createEmbed(tickers) });
		});
	}

	if (cmd(message, 'btc')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[0].price_usd * message.content.split(' ')[1]}`);
		});
	}
	if (cmd(message, 'zec')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[1].price_usd * message.content.split(' ')[1]}`);
		});
	}
	if (cmd(message, 'eth')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[2].price_usd * message.content.split(' ')[1]}`);
		});
	}
	if (cmd(message, 'xmr')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[3].price_usd * message.content.split(' ')[1]}`);
		});
	}
	if (cmd(message, 'etc')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[4].price_usd * message.content.split(' ')[1]}`);
		});
	}
	if (cmd(message, 'lbc')) {
		getTickers(tickers => {
			message.channel.send(`$${tickers[5].price_usd * message.content.split(' ')[1]}`);
		});
	}
});

client.login('MzIzNTkxNTIzNzEzMTU1MDc0.DB9ZLA.FOFrY8wSQbb8ecFbX_CXtN0VUaQ');
