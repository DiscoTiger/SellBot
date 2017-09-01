/* eslint-disable no-console */
const moment = require('moment');
let ctx;
try {
	const chalk = require('chalk');

	ctx = new chalk.constructor({ enabled: true });
} catch (err) { console.error(err); }

function getTime() {
	return ` ${moment().format('LTS')}`.slice(-11);
}

module.exports = {
	empty(...args) {
		if (ctx) console.log(getTime(), '|', ...args);
		else console.log(getTime(), '|', ...args);
	},
	log(...args) {
		if (ctx) console.log(getTime(), '|', ctx.grey('[LOG] '), ...args);
		else console.log(getTime(), '|', ...args);
	},
	info(...args) {
		if (ctx) console.log(getTime(), '|', ctx.cyan('[INFO]'), ...args);
		else console.log(getTime(), '|', ...args);
	},
	status(...args) {
		if (ctx) console.log(getTime(), '|', ctx.cyan('[STAT]'), ...args);
		else console.log(getTime(), '|', ...args);
	},
	command(...args) {
		if (ctx) console.log(getTime(), '|', ctx.green('[CMD] '), ...args);
		else console.log(getTime(), '|', ...args);
	},
	warn(...args) {
		if (ctx) console.error(getTime(), '|', ctx.yellow('[WARN]'), ...args);
		else console.error(getTime(), '|', ...args);
	},
	error(...args) {
		if (ctx) console.error(getTime(), '|', ctx.red('[ERR] '), ...args);
		else console.error(getTime(), '|', ...args);
	}
};
