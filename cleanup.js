function noOp() {} // eslint-disable-line no-empty-function
const log = require('./log.js');

exports.cleanup = function cleanup(callback) {
	// Attach user callback to the process event emitter
	// if no callback, it will still exit gracefully on Ctrl-C
	callback = callback || noOp;
	process.on('cleanup', callback);

	// Do app specific cleaning before exiting
	process.on('exit', () => {
		process.emit('cleanup');
		log.log('Process closed');
		process.stdin.resume();
	});

	// Catch ctrl+c event and exit normally
	process.on('SIGINT', () => {
		log.warn('Process closing for: SIGINT');
		process.exit(2);
	});

	process.on('SIGHUP', () => {
		log.warn('Process closing for: SIGHUP');
		process.exit(2);
	});

	// Catch uncaught exceptions, trace, then exit normally
	process.on('uncaughtException', err => {
		log.error('Process closing for:');
		log.error('Uncaught Exception:');
		log.error(err.stack);
		process.exit(99);
	});

	// Catch unhandled promise rejections and trace
	process.on('unhandledRejection', err => {
		log.error('UnhandledPromiseRejection:');
		log.error(err);
	});
};
