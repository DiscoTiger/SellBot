const ArgumentType = require('./base');

class CryptoArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(value) {
		return value ? this.client.tickers.has(value.toUpperCase()) : false;
	}

	parse(value) {
		return value.toUpperCase();
	}
}

module.exports = CryptoArgumentType;
