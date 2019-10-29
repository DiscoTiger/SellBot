/* eslint-disable max-len */
const Command = require('../command.js');
const Types = require('../types');

class Help extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			description: 'Displays help about all or specific commands',
			use: [
				{
					key: 'command',
					required: false,
					type: Types.CommandArgumentType
				}
			],
			example: '*help prices* - shows detailed help for the prices command',
			aliases: [],
			permissions: [],
			ownerOnly: false
		});
	}

	run(msg, args, serverConfig) {
		let helpString = `**Sellbot Help for ${msg.guild.name}**
	Command Prefix: ${serverConfig.prefix}

`;
		const command = args[0];

		if (command) {
			helpString += generateDetailedHelp(command);
		} else {
			this.client.commands.forEach(cmd => {
				helpString += generateGenericHelp(cmd);
			}, this);
		}

		if (serverConfig.sendHelpToDM === 1) { // eslint-disable-line eqeqeq
			msg.author.send(helpString)
				.then(() => msg.channel.send('Sent a DM with the information.'))
				.catch(() => msg.reply('I couldn\'t send you a DM with the information. Please enable DMs (even temporarily)'));
		} else {
			msg.channel.send(helpString);
		}
	}
}

/**
 * Generates generic help string about command
 * @param {Command} command command to generate help string from
 * @returns {string} generic help string for a command
 */
function generateGenericHelp(command) {
	return `**${command.name}:** ${command.description}\n`;
}

/**
 * Generates detailed help string about command and use
 * @param {Command} command command to generate help string from
 * @returns {string} detailed help string for a command
 */
function generateDetailedHelp(command) {
	let out = `**${command.name}:** ${command.description}\n`;

	if (command.use) {
		if (command.use.length > 0) {
			out += `**Usage:**\n${generateArgsHelp(command)}\n`;
		}
	}
	if (command.example) {
		out += `**Example:**\n\t${command.example}`;
	}

	return out;
}

function generateArgsHelp(command) {
	let out = '';
	for (let arg of command.use) {
		out += `\t${arg.required ? '<' : '['}${arg.key}${arg.required ? '>' : ']'}${arg.description ? ` - ${arg.description}` : ''}\n`;
	}
	return out;
}

module.exports = Help;
