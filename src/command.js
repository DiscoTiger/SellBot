const Sellbot = require('./sellbotclient.js');
/**
 * Base command class
 */
class Command {
	/**
	* @typedef {Object} CommandOptions
	* @property {string} name The command name.
	* @property {string} description The command description.
	* @property {Array<Array<string, boolean>>} use The command arguments.
	* @property {string} example An example of the command in use
	* @property {Array<string>} aliases Aliases for the command.
	* @property {Array<string>} permissions Permissions required to run the command.
	* @property {boolean} ownerOnly If the command can only be run by a bot owner.
	*/

	/**
	* @class Command
	* @param {Sellbot} client The client object
	* @param {CommandOptions} options The command options
	*/
	constructor(client, options) {
		this.client = client;

		this.name = options.name;
		this.description = options.description;
		this.use = options.use;
		this.example = options.example;
		this.aliases = options.aliases;
		this.permissions = options.permissions;
		this.ownerOnly = !!options.ownerOnly;
	}
	/* eslint-disable max-len */
	_validateCommand() {
		if (!(this.client instanceof Sellbot)) throw new TypeError('Command - Command constructor parameter client must be the Sellbot client.');
		if (!this.name) throw new Error('Command - Command name is required.');
		if (!this.type) throw new Error('Command - Command type is required.');
		if (!this.description) throw new Error('Command - Command description is required.');
		if (this.aliases && !Array.isArray(this.aliases)) throw new TypeError('Command - Command aliases must be in an array.');
		if (this.use && !Array.isArray(this.use)) throw new TypeError('Command - Command use must be an array.');
	}

	/**
     * The command to be run.
     * @method run
     * @abstract
     * @param {Message} msg - The discord.js message object.
     * @param {Array<string>} args - The command arguments.
     */
	run(msg, args) { // eslint-disable-line no-unused-vars
		throw new TypeError(`Command - The command file ${this.name} does not have a run function.`);
	}
}

module.exports = Command;
