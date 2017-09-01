/* eslint-disable max-len, consistent-return */
const Command = require('../command.js');

class Currency extends Command {
	constructor(client) {
		super(client, {
			name: 'currency',
			description: 'Add or remove <symbol> from the list of currencies',
			use: [
				['\'add\' | \'remove\'', true],
				['<symbol>', true]
			],
			example: '*currency add LTC* - Add Litecoin to the list of currencies',
			aliases: [],
			permissions: ['MANAGE_SERVER'],
			ownerOnly: false
		});
	}

	run(msg, args, serverConfig) {
		if (!this.client.tickers.has(args[1].toUpperCase())) return msg.channel.send(`Invalid cryptocurrency symbol: ${args[1]}`);
		switch (args[0].toLowerCase()) {
			case 'add':
				if (serverConfig.currencies.includes(args[1].toUpperCase())) return msg.channel.send(`Symbol: ${args[1]} is already in the list.`);
				if (serverConfig.currencies.length >= 8) return msg.channel.send(`You may not add more than 8 currencies.`);

				serverConfig.currencies.push(args[1].toUpperCase());
				this.client.setServerConfig(msg.guild.id, serverConfig);
				break;
			case 'remove':
				if (!serverConfig.currencies.includes(args[1].toUpperCase())) return msg.channel.send(`Symbol: ${args[1]} is not in the list.`);

				serverConfig.currencies = serverConfig.currencies.filter(item => item !== args[1].toUpperCase());
				this.client.setServerConfig(msg.guild.id, serverConfig);
				break;
			default:
				msg.channel.send(`Invalid command '${args[0]},' please use \`${serverConfig.prefix}help ${this.name}\` for details.`);
				return;
		}
		msg.channel.send(`Successfully ${args[0].toLowerCase() === 'add' ? 'added' : 'removed'} ${args[1]}.`);
	}
}

module.exports = Currency;
