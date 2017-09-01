/* eslint-disable consistent-return, max-len */
const Discord = require('discord.js');
const Sellbot = require('./sellbotclient.js');

/* eslint-disable key-spacing */
const client = new Sellbot({
	configPath: 				'./config.json',
	defaultServerConfigPath: 	'./defaultConfig.json',
	commandsDir: 				'./commands/',
	disableEveryone:			true,
	disabledEvents: [
		'TYPING_START'
	]
});
/* eslint-enable key-spacing */

const { log } = client;

client.on('guildCreate', guild => {
	if (!client.configs.has(guild.id)) client.setServerConfig(guild.id);
});

client.login();
