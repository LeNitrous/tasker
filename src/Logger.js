const chalk = require('chalk');
	
module.exports = {
	
	info(text, h = 'INFO') {
		return console.log(`${chalk.bgGreen.black(` ${h} `)} ${text}`);
	},

	infoGeneric(text, h = 'INFO') {
		return console.log(`${chalk.bgWhite.black(` ${h} `)} ${text}`);
	},
	
	debug(text, h = 'DEBUG') {
		return console.log(`${chalk.bgWhite.black(` ${h} `)} ${text}`);
	},
	
	warn(text, h = 'WARN') {
		return console.log(`${chalk.bgYellow.black(` ${h} `)} ${text}`);
	},
	
	error(text, h = 'ERROR') {
		return console.log(`${chalk.bgRed.white(` ${h} `)} ${text}`);
	},
	
	logCommand(guildName, userName, commandName, channelName) {
		if (guildName)
			return console.log(`${chalk.bold.green(userName)} @ ${chalk.bold.blue(guildName)} in ${chalk.bold.cyan('#')}${chalk.bold.cyan(channelName)} ${chalk.bold.yellow('»')} ${commandName}`);
		return console.log(`${chalk.bold.green(userName)} ${chalk.bold.yellow('»')} ${commandName}`);
	}
	
};