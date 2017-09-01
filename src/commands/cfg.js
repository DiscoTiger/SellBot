/* eslint-disable max-len, consistent-return */
const Command = require('../command.js');

function generateConfigPropertiesList(serverConfig) {
	let list = '__**Server Configuration Properties:**__\n\n';
	for (let prop in serverConfig) {
		list += `**${prop}:** ${serverConfig[prop]}\n`;
	}
	return list;
}

class Config extends Command {
	constructor(client) {
		super(client, {
			name: 'cfg',
			description: 'Sets <key> of config to [value] or resets the config to default',
			use: [
				['<key> | \'default\'', false],
				['[value]', false],
				['[add | remove] - If configuring a list, whether to \'add\' or \'remove\' [value] from the list']
			],
			example: '*cfg prefix !* - Sets \'prefix\' to \'!\'\n\t*cfg currencies BTC add* - adds \'BTC\' to the \'currencies\' list',
			aliases: [
				'config'
			],
			permissions: [
				'MANAGE_GUILD'
			],
			adminOnly: true
		});
	}

	run(msg, args, serverConfig) {
		const key = args[0];
		let val = args[1];
		let op = args[2];
		if (op) op = op.toLowerCase();
		if (!key) return msg.channel.send(generateConfigPropertiesList(serverConfig));
		if (key.toLowerCase() === 'default') {
			this.client.setServerConfig(msg.guild.id);
			return msg.channel.send('Set server config to the default');
		}
		if (!Object.getOwnPropertyNames(serverConfig).includes(key)) return msg.channel.send(`${key} isn't a valid property name. Could not modify config.\n${generateConfigPropertiesList(serverConfig)}`);
		if (!val) return msg.channel.send(`Invalid arguments: You must provide a value. Use \`${serverConfig.prefix}help\` for details.`);

		if (Array.isArray(serverConfig[key])) {
			if (op !== 'add' && op !== 'remove') return msg.channel.send(`${key} is a list. You must specify an operation ('add' or 'remove') to configure lists.`);
			if (op === 'add') serverConfig[key].push(val);
			if (op === 'remove') {
				if (!serverConfig[key].includes(val)) return msg.channel.send(`'${val}' is not a valid item in '${key},' could not remove it.`);
				serverConfig[key] = serverConfig[key].filter(item => item !== val);
			}
			msg.channel.send(`Successfully ${op === 'add' ? 'add' : 'remov'}ed '${val}'`);
		} else {
			if (typeof serverConfig[key] === 'number') val = parseInt(val.replace(/[^0-9.]/, ''));
			msg.channel.send(`Set value of '${key}' to '${val}' (from '${serverConfig[key]}')`);
			serverConfig[key] = val;
		}
		this.client.setServerConfig(msg.guild.id, serverConfig);
	}
}

module.exports = Config;
