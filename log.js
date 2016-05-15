var logger = require("winston");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true,
	timestamp: function() {
		var date = new Date();
		return date.getTime();
	},
	level: "verbose"
});

module.exports = logger;
