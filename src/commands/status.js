const Command = require('../command');
const { RichEmbed } = require('discord.js');

class Status extends Command {
	constructor(client) {
		super(client, {
			name: 'status',
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
			.addField('Prefix', serverConfig.prefix)
			.addField('Guild Count', this.client.guilds.size)
			.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);

		msg.channel.send({ embed: emb });
	}
}

module.exports = Status;
