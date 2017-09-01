/* eslint-disable consistent-return, max-len */
const Discord = require('discord.js');
const Sellbot = require('./sellbotclient.js');
const log = require('./log.js');

/* eslint-disable key-spacing */
const client = new Sellbot({
	configPath: 				'./config.json',
	defaultServerConfigPath: 	'./defaultConfig.json',
	disableEveryone:			true,
	commandsDir: 				'./commands/'
});
/* eslint-enable key-spacing */

client.on('message', msg => { // eslint-disable-line complexity
	if (msg.author.bot) return;
	if (!msg.guild) return;

	if (!client.configs.has(msg.guild.id)) {
		client.setServerConfig(msg.guild.id);
		msg.channel.send('Your guild didn\'t have a configuration file. We\'ve generated one for you with default settings that you can change any time with the command `cfg`'); // eslint-disable-line
	}
	let serverConfig = client.configs.get(msg.guild.id);

	if (!msg.content.startsWith(serverConfig.prefix.toLowerCase())) return;
	const args = msg.content.split(' ').slice(1);
	const cmd = msg.content.split(' ')[0].substring(serverConfig.prefix.length).toLowerCase();

	log.log('COMMAND', msg.content);
	client.updateAllTickers();

	log.log(client.tickers);

	if (cmd === 'prices') {
		let emb = new Discord.RichEmbed()
			.setTitle(':b:rypto:b:urrency :b:rices')
			.setTimestamp();
		for (let symbol of serverConfig.currencies) {
			const t = client.tickers.get(symbol.toUpperCase());
			let chg1D = t.percent_change_24h;
			if (chg1D >= 0) chg1D = `+${chg1D}`;

			chg1D += '%';
			emb.addField(`${t.symbol} (${t.name})`, `[24 Hour Change${chg1D}](${client.config.prettyTickerUrlBase}${t.id}/)`, true)
				.addField('Price USD:', `$${t.price_usd}`, true)
				.addField('Price BTC:', t.price_btc, true);
		}
		msg.channel.send({ embed: emb });
	} else if (client.tickers.has(cmd.toUpperCase())) {
		if (args[1]) {
			if (!client.tickers.has(args[1].toUpperCase())) return msg.reply(`Invalid cryptocurrency symbol: ${args[1]}`);
			let numOther = (args[0] * client.tickers.get(cmd.toUpperCase()).price_btc) / client.tickers.get(args[1].toUpperCase()).price_btc; // eslint-disable-line max-len
			msg.channel.send(`${numOther} ${args[1].toUpperCase()}`);
		} else {
			msg.channel.send(`$${client.tickers.get(cmd.toUpperCase()).price_usd * args[0]}`);
		}
	} else if (cmd === 'info') {
		if (!args[0]) return msg.reply('Please provide a currency name');
		if (!client.tickers.has(args[0].toUpperCase())) return msg.reply('Invalid currency symbol');
		let t = client.tickers.get(args[0].toUpperCase());
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
	} else if (cmd === 'help') {
		if (serverConfig.sendHelpToDM === 'yes') {
			msg.author.send(generateHelpMessage(msg, serverConfig))
				.then(() => msg.reply('Sent a DM with the information.'))
				.catch(() => msg.reply('I couldn\'t send you a DM with the information. Please enable DMs (even temporarily)'));
		} else {
			msg.channel.send(generateHelpMessage(msg, serverConfig));
		}
	} else if (cmd === 'cfg') {
		if (!msg.member.permissions.has('MANAGE_GUILD')) 					return msg.reply('Invalid permissions: You need to have the \'Manage Server\' permission to run this command.');
		if (!args[0]) 														return msg.channel.send(generateConfigPropertiesList(serverConfig));
		if (args[0].toLowerCase() === 'default') {
			client.generateServerConfig(msg.guild.id);
			return msg.reply('Set server config to the default');
		}
		if (args[0] === 'currencies') 										return msg.reply(`Cannot modify that property, please use the command \`${serverConfig.prefix}currencies\``);
		if (!Object.getOwnPropertyNames(serverConfig).includes(args[0])) {
			return msg.reply(`${args[0]} isn't a valid property name. Could not modify config.\n${generateConfigPropertiesList(serverConfig)}`);
		}
		if (!args[1])														return msg.reply(`Invalid arguments: You must provide a value. Use \`${serverConfig.prefix}help\` for details.`);
		if (args[0] === 'sendHelpToDM' && args[1] !== 'yes' && args[1] !== 'no') return msg.reply('Value of sendHelpToDM must be either \'yes\' or \'no\'.');
		msg.channel.send(`Set value of '${args[0]}' to '${args[1]}' (from '${serverConfig[args[0]]}')`);
		serverConfig[args[0]] = args[1];
		client.configs.set(msg.guild.id, serverConfig);
	} else if (cmd === 'currency') {
		if (!msg.member.permissions.has('MANAGE_GUILD')) return msg.reply('Invalid permissions. You need to have the \'Manage Server\' permission to run this command.');
		if (!args[0] || !args[1])						 return msg.reply(`Invalid arguments, please use \`${serverConfig.prefix}help\` for details.`);
		if (!client.tickers.has(args[1].toUpperCase()))		 return msg.reply(`Invalid cryptocurrency symbol: ${args[1]}`);
		switch (args[0].toLowerCase()) {
			case 'add':
				if (serverConfig.currencies.includes(args[1].toUpperCase())) {
					return msg.reply(`Symbol: ${args[1]} is already in the list.`);
				}
				if (serverConfig.currencies.length >= 8) {
					return msg.reply(`You may not add more than 8 currencies.`);
				}
				serverConfig.currencies.push(args[1].toUpperCase());
				client.configs.set(msg.guild.id, serverConfig);
				break;
			case 'remove':
				if (!serverConfig.currencies.includes(args[1].toUpperCase())) {
					return msg.reply(`Symbol: ${args[1]} is not in the list.`);
				}
				serverConfig.currencies = serverConfig.currencies.filter(item => item !== args[1].toUpperCase());
				client.configs.set(msg.guild.id, serverConfig);
				break;
			default:
				msg.channel.send(`Invalid command '${args[0]},' please use \`{serverConfig.prefix}help\` for details.`);
				return;
		}
		msg.channel.send(`Successfully ${args[0].toLowerCase() === 'add' ? 'added' : 'removed'} ${args[1]}.`);
	}
});

client.on('guildCreate', guild => {
	if (!client.configs.has(guild.id)) client.setServerConfig(guild.id);
});

process.on('unhandledRejection', err => {
	log.error('UnhandledPromiseRejection: ', err);
});

function generateHelpMessage(msg, serverConfig) {
	return `**SELLBOT HELP**

Prefix for ${msg.guild.name}: ${serverConfig.prefix}

__*Sellbot Commands:*__

__Info__
**info:** Gets detailed information about a specific coin
	*usage:* info <symbol>
	*example:* into btc
**prices:** Gets information about a list of coins your server has configured
**converter** Converts prices of cryptocurrencies
	*usage:* <symbol> <amount> [OPTIONAL: symbol2 DEFAULT: USD]
	*example:* btc 1 *(Converts 1 BTC to USD)*
	*example:* btc 1 eth *(Converts 1 BTC to ETH)*

__Admin-Only__
**cfg:** Set server configuration values.
	*usage:* cfg <key | 'default'> <value>
	*example:* cfg prefix ! *(sets the configuration value 'prefix' to '!')*
**currency:** Change the list of currencies that display when using **${serverConfig.prefix}prices**
	*usage:* currency <add | remove> <symbol>
	*example:* currency remove BTC
`;
}

function generateConfigPropertiesList(serverConfig) {
	let list = '__**Server Configuration Properties:**__\n\n';
	for (let prop in serverConfig) {
		if (prop !== 'currencies') list += `**${prop}:** ${serverConfig[prop]}\n`;
	}
	return list;
}

client.login(client.config.token);
