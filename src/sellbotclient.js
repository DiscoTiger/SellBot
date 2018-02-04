/* eslint-disable complexity, consistent-return, max-len */
const { Client, Collection, Permissions } = require('discord.js');
const { promisify } = require('util');
const TimestampedMap = require('./TimestampedMap.js');
// This is temporary
const Enmap = require('enmap');
const cmcAPI = require('./tickers.js');
const logger = require('./log.js');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const path = require('path');
const snekfetch = require('snekfetch');
const Types = require('./types');

function noOp() {} // eslint-disable-line no-empty-function
function validatePermissions(perm) {
	return Object.keys(Permissions.FLAGS).includes(perm);
}

/**
 * Discord.js client extension with command framework, easy config, and helper methods for sellbot
 * @extends Client
 */
class Sellbot extends Client {
	/**
     * @typedef {Object} SellbotOptions
	 * @extends ClientOptions
     * @property {string} configPath  The path to the config file
	 * @property {string} defaultServerConfigPath The path to the default server config file
	 * @property {string} commandsDir The path to the commands folder
	 * @property {function} [cleanupFunction] Function to run on exit
     */

	/**
	 * @param {SellbotOptions} options Discord MessageOptions plus additional
	 */
	constructor(options = {}) {
		super(options);

		// Config loading
		this.config = {};
		if (options.configPath) {
			const dir = path.isAbsolute(options.configPath) ? options.configPath : path.join(process.cwd(), options.configPath);
			if (!fs.existsSync(dir)) throw new Error(`DiscoClient - No config found at ${dir}. Is this path correct?`);
			const { ext } = path.parse(dir);
			if (ext && ext !== '.json') throw new TypeError('Sellbot - Config file type must be json.');

			this.config = JSON.parse(fs.readFileSync(dir));
		} else { throw new Error('DiscoClient - No configuration file specified'); }

		if (options.defaultServerConfigPath) {
			const dir = path.isAbsolute(options.defaultServerConfigPath) ? options.defaultServerConfigPath : path.join(process.cwd(), options.defaultServerConfigPath);
			if (!fs.existsSync(dir)) throw new Error(`Sellbot - No config found at ${dir}. Is this path correct?`);
			const { ext } = path.parse(dir);
			if (ext && ext !== '.json') throw new TypeError('Sellbot - Default Server config file type must be json.');

			this.defaultServerConfig = JSON.parse(fs.readFileSync(dir));
		} else { throw new Error('Sellbot - No default server configuration file specified'); }

		/**
		 * Synchronous function that executes before the bot shuts down
		 * @abstract
		 */
		this.onCleanup = options.onCleanup || noOp;
		this._commandsDir = options.commandsDir;

		this.log = 		logger;
		this.commands = new Collection();
		this.aliases = 	new Collection();
		this.configs = 	new Enmap({ name: 'configs', dataDir: './data' });
		this.tickers =	new TimestampedMap();

		// Listeners
		this.on('ready', () => {
			this.user.setPresence({ game: { name: this.config.game, type: 0 } });
			this.updateAllTickers(true);
			this._postGuildCount();
			this.log.info('Ready');
		});

		this.on('message', this._processMessage);

		this.on('guildCreate', guild => {
			if (!this.configs.has(guild.id)) this.setServerConfig(guild.id);
			this._postGuildCount();
		});

		this.on('guildDelete', () => {
			this._postGuildCount();
		});

		this.on('warn', err => 			this.log.warn(err));
		this.on('error', err => 		this.log.error(err));
		this.on('disconnect', () => 	this.log.warn('Disconnected'));
		this.on('reconnecting', () => 	this.log.warn('Reconnecting'));
		// This.on('debug', info => 	this.log.log(info));

		this._registerCleanup();
		this._loadCommands();
	}

	/**
     * Loads the commands from the provided commands directory.
     * @method _loadCommands
     * @returns {SimpleClient}
	 * @private
     */
	_loadCommands() {
		const dir = path.join(process.cwd(), this._commandsDir);

		readdir(dir).then(files => {
			for (const file of files) {
				const Command = require(path.join(dir, file));
				const cmd = new Command(this);

				this.commands.set(cmd.name, cmd);

				if (cmd.aliases) {
					for (const alias of cmd.aliases) {
						if (this.aliases.has(alias)) {
							this.log.error(`Command ${cmd.name} has duplicate alias ${alias}!`);
							continue;
						}
						this.aliases.set(alias, cmd.name);
					}
				}
				if (this._debug) this.log.log(`Loaded ${cmd.name}!`);

				delete require.cache[require.resolve(path.join(dir, file))];
			}
		}).then(() => this.log.log(`Loaded ${this.commands.size} commands.`))
			.catch(this.log.error);

		return this;
	}

	/**
	 * Message handler
	 * @method _processMessage
	 * @param {Object} msg dab
	 * @async
	 * @private
	 * @returns {undefined}
	 */
	async _processMessage(msg) {
		if (msg.author.bot) return;
		if (!msg.guild) return;

		let command, args;
		if (!this.configs.has(msg.guild.id)) {
			this.setServerConfig(msg.guild.id);
			msg.channel.send('Your guild didn\'t have a configuration file. We\'ve generated one for you with default settings that you can change any time with the command `cfg`');
		}
		let serverConfig = this.configs.get(msg.guild.id);

		if (!msg.content.startsWith(serverConfig.prefix.toLowerCase())) return;

		[command = '', ...args] = msg.content.slice(serverConfig.prefix.length).split(/ +/);
		command = command.toLowerCase();

		const cmdFile = this.commands.get(command) || this.commands.get(this.aliases.get(command));

		if (!cmdFile) return;

		if (cmdFile.adminOnly) {
			if (!serverConfig.admins.includes(msg.author.id) && msg.author.id !== msg.guild.ownerID && !msg.member.roles.filter(x => serverConfig.adminRoles.includes(x.id)).size > 0) {
				return msg.reply('You cannot use that command, you are not configured as a bot administrator');
			}
		}

		if (cmdFile.permissions) {
			const perms = cmdFile.permissions.filter(validatePermissions);
			let missing = [];

			for (const perm of perms) if (!msg.member.hasPermission(perm)) missing.push(perm);

			if (missing.length) return msg.channel.send(`You need the following permissions to run this command: \`\`\`\n${missing.join(', ')}\n\`\`\``);
		}

		// Const minArgCount = cmdFile.use ? cmdFile.use.filter(a => a.required || false).length : 0;

		// if (args.length < minArgCount) return msg.channel.send(`Invalid arguments: use \`${serverConfig.prefix}help ${command}\` for details.`);

		for (let i in cmdFile.use) {
			const arg = cmdFile.use[i];
			if (!args[i] && arg.required) return msg.channel.send(`The argument ${arg.key} is required.`);
			if (args[i]) {
				const type = arg.type ? new arg.type(this) : new Types.StringArgumentType(this); // eslint-disable-line new-cap
				if (!type.validate(args[i], msg, arg)) return msg.channel.send(`Invalid value for argument '${arg.key}'`);
				args[i] = type.parse(args[i]);
			}
		}

		this.updateAllTickers();
		this.log.log('Command: ', msg.content);
		try {
			await cmdFile.run(msg, args, serverConfig);
		} catch (err) {
			this.log.error(err);
			msg.channel.send(`There was an error running the ${cmdFile.name} command. \`\`\`xl\n${err}\`\`\`This should never happen.`);
		}
	}

	/**
	 * Code that should be ran upon exiting the process
	 */
	_onCleanup() {
		this.log.log('Closing config database');
		this.configs.close();
		this.onCleanup();
	}

	/**
	 * Adds listeners for error and close events / signals that log properly and run a cleanup function before closing
	 */
	_registerCleanup() {
		this.on('cleanup', () => {
			this._onCleanup();
		});

		process.on('exit', () => {
			this.emit('cleanup');
			this.log.log('Process closed');
			process.stdin.resume();
		});

		// Catch termination events like ctrl+c
		process.on('SIGINT', () => {
			this.log.warn('Process closing for: SIGINT');
			process.exit(128 + 2);
		});

		// This one is iffy, but a good safeguard for Windows CMD exit
		process.on('SIGTERM', () => {
			this.log.warn('Process closing for: SIGTERM');
			process.exit(128 + 15);
		});

		process.on('SIGHUP', () => {
			this.log.warn('Process closing for: SIGHUP');
			process.exit(128 + 1);
		});

		// Catch uncaught exceptions, trace, then exit normally
		process.on('uncaughtException', err => {
			this.log.error('Uncaught Exception:');
			this.log.error(err.stack);
			// Exit code 1 even though exception is technically 'handled'
			process.exit(1);
		});

		// Catch unhandled promise rejections and trace
		process.on('unhandledRejection', err => {
			this.log.error('UnhandledPromiseRejection:');
			this.log.error(err);
			// Exit on unhandled rejection because cracking down on things before public release
			process.exit(1);
		});
	}

	_postGuildCount() {
		if (!this.config.dbotstoken || !this.config.dbotspwtoken) return this.log.warn('No discord bot list api token found!');

		snekfetch.post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
			.set('Authorization', this.config.dbotstoken)
			.send({ server_count: this.guilds.size }) // eslint-disable-line camelcase
			.then(() => this.log.info(`dbots stats updated successfully`))
			.catch(err => this.log.error(err));

		snekfetch.post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
			.set('Authorization', this.config.dbotspwtoken)
			.send({ server_count: this.guilds.size }) // eslint-disable-line camelcase
			.then(() => this.log.info('dbotspw stats updated successfully'))
			.catch(err => this.log.error(err));
	}

	/**
	 * Logs in to discord
	 * @override
	 * @param {string} [token] - Optional token to override config token
	 */
	login(token) {
		super.login(this.config.token || token);
	}

	/**
	 * Loads all tickers into cache if they are older than the configured time limit
	 * @param {bool} override Optional: update tickers regardless of cache time
	 * @async
	 */
	async updateAllTickers(override) {
		if (this.tickers.getLastEdit() > this.config.tickerCacheTimeMS || override) {
			cmcAPI.mapTickers(this.tickers, await cmcAPI.getAllTickers()
				.then(this.log.log('Tickers loaded'))
				.catch(err => this.log.error(err.message)));
		}
	}

	/**
	 * Sets a guilds config to default
	 * @param {*} id Guild id
	 * @param {*} config Optional config object to override the default
	 * @returns {Object} Config object set.
	 */
	setServerConfig(id, config) {
		let cfg = config || this.defaultServerConfig;
		this.configs.set(id, cfg);
		return cfg;
	}
}

module.exports = Sellbot;
