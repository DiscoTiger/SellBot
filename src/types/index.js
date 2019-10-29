/*
Require('fs').readdirSync(`${__dirname}/`).forEach(file => {
	if (file === 'index.js') return;
	let name = file.replace('.js', '');
	exports[name] = require(`./${file}`);
});
*/
module.exports = {
	StringArgumentType: require('./string'),
	MemberArgumentType: require('./member'),
	UserArgumentType: require('./user'),
	IntegerArgumentType: require('./integer'),
	FloatArgumentType: require('./float'),
	CommandArgumentType: require('./command'),
	CryptoArgumentType: require('./crypto'),
	ArgumentType:	require('./base')
};
