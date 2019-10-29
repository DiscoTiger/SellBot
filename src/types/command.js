const ArgumentType = require('./base');

class CommandArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command');
	}

	validate(value) {
		const name = value ? value.toLowerCase() : '';
		return this.client.commands.has(name) || this.client.aliases.has(name);
	}

	parse(value) {
		const name = value ? value.toLowerCase() : '';
		return this.client.commands.get(name) || this.client.aliases.get(name);
	}
}

module.exports = CommandArgumentType;
