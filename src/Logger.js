const chalk = require('chalk');
	
module.exports = {
	
	info(text, h = 'INFO') {
		return console.log(`${getTimestamp()} ${chalk.bgGreen.black(` ${h} `)} ${text}`);
	},

	generic(text, h = 'INFO') {
		return console.log(`${getTimestamp()} ${chalk.bgWhite.black(` ${h} `)} ${text}`);
	},
	
	debug(text, h = 'DEBUG') {
		return console.log(`${getTimestamp()} ${chalk.bgWhite.black(` ${h} `)} ${text}`);
	},
	
	warn(text, h = 'WARN') {
		return console.log(`${getTimestamp()} ${chalk.bgYellow.black(` ${h} `)} ${text}`);
	},
	
	error(text, h = 'ERROR') {
		return console.log(`${getTimestamp()} ${chalk.bgRed.white(` ${h} `)} ${text}`);
	},
	
	logCommand(guildName, userName, commandName, channelName) {
		if (guildName)
			return console.log(`${getTimestamp()} ${chalk.bold.green(userName)} @ ${chalk.bold.blue(guildName)} in ${chalk.bold.cyan('#')}${chalk.bold.cyan(channelName)} ${chalk.bold.yellow('»')} ${commandName}`);
		else
			return console.log(`${getTimestamp()} ${chalk.bold.green(userName)} ${chalk.bold.yellow('»')} ${commandName}`);
	}
	
};

function getTimestamp() {
	var date = new Date.now();
	var h = date.getHours().toString().padStart(2, "0");
	var m = date.getMinutes().toString().padStart(2, "0");
	var s = date.getSeconds().toString().padStart(2, "0");
	return `[${h}:${m}:${s}]`;
}