const Command = require('../command');
const { RichEmbed } = require('discord.js');

class Status extends Command {
	constructor(client) {
		super(client, {
			name: 'prices',
			description: 'Displays info about Sellbot.',
			use: [],
			aliases: [
				'about'
			],
			permissions: [],
			adminOnly: false
		});
	}

	run(msg, args, serverConfig) {
		const emb = new RichEmbed()
			.setTitle(`Sellbot v${this.client.config.version} Info`)
			.addField('Prefix', serverConfig.prefix);
		
			msg.channel.send({ embed: emb });
	}
}

module.exports = Status;
