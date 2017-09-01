const Command = require('../command.js');

class Say extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			description: 'simple ping pong command',
			use: [],
			aliases: [
				'sudo'
			],
			permissions: [],
			ownerOnly: false
		});
	}

	run(msg, args) {
		msg.channel.send(args.join(' '));
	}
}

module.exports = Say;
