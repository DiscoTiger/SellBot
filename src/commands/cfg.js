/* eslint-disable max-len, consistent-return */
const Command = require('../command.js');

function generateConfigPropertiesList(serverConfig) {
	let list = '__**Server Configuration Properties:**__\n\n';
	for (let prop in serverConfig) {
		if (prop !== 'currencies') list += `**${prop}:** ${serverConfig[prop]}\n`;
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
				['[value]', false]
			],
			example: '*cfg prefix !* - Sets \'prefix\' to \'!\'',
			aliases: [
				'config'
			],
			permissions: [
				'MANAGE_GUILD'
			],
			ownerOnly: false
		});
	}

	run(msg, args, serverConfig) {
		const key = args[0];
		let val = args[1];
		if (!key) return msg.channel.send(generateConfigPropertiesList(serverConfig));
		if (key.toLowerCase() === 'default') {
			this.client.setServerConfig(msg.guild.id);
			return msg.channel.send('Set server config to the default');
		}
		if (key === 'currencies') return msg.reply(`Cannot modify that property, please use the command \`${serverConfig.prefix}currencies\``);
		if (!Object.getOwnPropertyNames(serverConfig).includes(key)) {
			return msg.reply(`${key} isn't a valid property name. Could not modify config.\n${generateConfigPropertiesList(serverConfig)}`);
		}
		if (!val) return msg.reply(`Invalid arguments: You must provide a value. Use \`${serverConfig.prefix}help\` for details.`);
		if (typeof serverConfig[key] === 'number')
		{
			val = parseInt(val.replace(/[^0-9.]/, ''));
		}
		if (key === 'sendHelpToDM' && val !== 0 && val !== 1) return msg.reply('Value of sendHelpToDM must be either 1 or 0.'); // eslint-disable-line eqeqeq
		msg.channel.send(`Set value of '${key}' to '${val}' (from '${serverConfig[key]}')`);
		serverConfig[key] = val;
		this.client.setServerConfig(msg.guild.id, serverConfig);
	}
}

module.exports = Config;
