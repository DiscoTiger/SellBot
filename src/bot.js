/* eslint-disable consistent-return, max-len */
const Sellbot = require('./sellbotclient.js');

/* eslint-disable key-spacing */
const client = new Sellbot({
	configPath: 				'./config.json',
	defaultServerConfigPath: 	'./defaultConfig.json',
	commandsDir: 				'./commands/',
	disableEveryone:			true,
	disabledEvents: [
		'GUILD_MEMBER_ADD',
		'GUILD_MEMBER_REMOVE',
		'GUILD_MEMBER_UPDATE',
		'GUILD_BAN_ADD',
		'GUILD_BAN_REMOVE',
		'CHANNEL_CREATE',
		'CHANNEL_DELETE',
		'CHANNEL_UPDATE',
		'CHANNEL_PINS_UPDATE',
		'MESSAGE_DELETE',
		'MESSAGE_DELETE_BULK',
		'MESSAGE_REACTION_ADD',
		'MESSAGE_REACTION_REMOVE',
		'MESSAGE_REACTION_REMOVE_ALL',
		'USER_NOTE_UPDATE',
		'USER_SETTINGS_UPDATE',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_SERVER_UPDATE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE'
	]
});
/* eslint-enable key-spacing */

const { log } = client;

client.on('guildCreate', guild => {
	if (!client.configs.has(guild.id)) client.setServerConfig(guild.id);
});

client.login();
