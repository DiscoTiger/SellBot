/* eslint-disable max-len, consistent-return */
const Command = require('../command.js');
const Types = require('../types');

async function generateConfigPropertiesList(serverConfig, guild) {
	guild = await guild.fetchMembers();
	let list = '__**Server Configuration Properties:**__\n\n';
	for (let prop in serverConfig) {
		let out = '';
		if (prop === 'adminRoles') {
			for (let role of serverConfig[prop]) {
				if (!role) break;
				out += `\n\t${role}: ${guild.roles.get(role).name}`;
			}
		} else if (prop === 'admins') {
			for (let user of serverConfig[prop]) {
				if (!user) break;
				out += `\n\t${user}: ${guild.members.get(user).user.tag}`;
			}
		} else if (prop === 'currencies') {
			out = serverConfig[prop].join(', ');
		} else {
			out = serverConfig[prop];
		}
		list += `**${prop}:** ${out}\n`;
	}
	return list;
}

class Config extends Command {
	constructor(client) {
		super(client, {
			name: 'cfg',
			description: 'Sets <key> of config to [value] or resets the config to default',
			use: [
				{
					key: 'key',
					required: false,
					description: 'config value to edit | default',
					type: Types.StringArgumentType
				},
				{
					key: 'value',
					description: 'value to be set / object to add or remove',
					required: false
				}
			],
			example: '*cfg prefix !* - Sets \'prefix\' to \'!\'\n\t*cfg currencies BTC* - adds \'BTC\' to the \'currencies\' list or removes \'BTC\' from the list if it is present.',
			aliases: [
				'config'
			],
			permissions: [
				'MANAGE_GUILD'
			],
			adminOnly: true
		});
	}

	async run(msg, args, serverConfig) {
		const key = args[0];
		let val = args[1];
		// If no key provided, quit and send a list of valid keys and values
		if (!key) return msg.channel.send(await generateConfigPropertiesList(serverConfig, msg.guild), { split: true });
		// If key is 'default' et config to default
		if (key.toLowerCase() === 'default') {
			this.client.setServerConfig(msg.guild.id);
			return msg.channel.send('Set server config to the default');
		}
		if (!Object.getOwnPropertyNames(serverConfig).includes(key)) return msg.channel.send(`${key} isn't a valid property name. Could not modify config.`);
		if (!val) return msg.channel.send(`Invalid arguments: You must provide a value. Use \`${serverConfig.prefix}help\` for details.`);

		if (Array.isArray(serverConfig[key])) {
			if (key === 'currencies') val = val.toUpperCase();

			if (!serverConfig[key].includes(val)) {
				if (serverConfig[key].length >= 8) return msg.channel.send('You cannot specify more than 8 currencies.');
				serverConfig[key].push(val);
			} else {
				serverConfig[key] = serverConfig[key].filter(item => item !== val);
			}

			msg.channel.send(`Successfully ${serverConfig[key].includes(val) ? 'added' : 'removed'} '${val}'`);
		} else {
			if (typeof serverConfig[key] === 'number') val = parseInt(val);
			msg.channel.send(`Set value of '${key}' to '${val}' (from '${serverConfig[key]}')`);
			serverConfig[key] = val;
		}
		this.client.setServerConfig(msg.guild.id, serverConfig);
	}
}

module.exports = Config;
