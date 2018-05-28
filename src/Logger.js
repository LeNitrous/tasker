const chalk = require('chalk');
const fs = require('fs');

class Logger {
	constructor(logFile) {
		this.logFile = logFile || null;

		if (this.logFile) {
			var header = [
				"-------------------------------------------------------------",
				`Runtime Log for Tasker`,
				`started on ${new Date()}`,
				`running on ${process.platform}`,
				"-------------------------------------------------------------",
			];
			fs.writeFile(this.logFile, header.join("\n"), function(error) {
				if (error) throw error;
			});
		}
	}

	info(text, h = 'INFO') {
		var log = `${getTimestamp()} ${chalk.bgGreen.black(` ${h} `)} ${text}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}
	
	debug(text, h = 'DEBUG') {
		var log = `${getTimestamp()} ${chalk.bgWhite.black(` ${h} `)} ${text}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}
	
	warn(text, h = 'WARN') {
		var log = `${getTimestamp()} ${chalk.bgYellow.black(` ${h} `)} ${text}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}
	
	error(text, h = 'ERROR') {
		var log = `${getTimestamp()} ${chalk.bgRed.white(` ${h} `)} ${text}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}

	log(text) {
		var log = `${getTimestamp()} ${text}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}
	
	logCommand(guildName, userName, commandName, channelName) {
		var log;
		if (guildName)
			log = `${getTimestamp()} ${chalk.bold.green(userName)} @ ${chalk.bold.blue(guildName)} in ${chalk.bold.cyan('#')}${chalk.bold.cyan(channelName)} ${chalk.bold.yellow('»')} ${commandName}`;
		else
			log = `${getTimestamp()} ${chalk.bold.green(userName)} ${chalk.bold.yellow('»')} ${commandName}`;
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + log, function(error) {
				if (error) throw error;
			});
		}
	}
}

module.exports = Logger;

function getTimestamp() {
	var date = new Date();
	var h = date.getHours().toString().padStart(2, "0");
	var m = date.getMinutes().toString().padStart(2, "0");
	var s = date.getSeconds().toString().padStart(2, "0");
	return `[${h}:${m}:${s}]`;
}