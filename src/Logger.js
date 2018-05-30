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
		console.log(`${getTimestamp()} ${chalk.bgGreen.black(` ${h} `)} ${text}`);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + `${getTimestamp()} ${h} ${text}`, function(error) {
				if (error) throw error;
			});
		}
	}
	
	debug(text, h = 'DEBUG') {
		console.log(`${getTimestamp()} ${chalk.bgWhite.black(` ${h} `)} ${text}`);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + `${getTimestamp()} ${h} ${text}`, function(error) {
				if (error) throw error;
			});
		}
	}
	
	warn(text, h = 'WARN') {
		console.log(`${getTimestamp()} ${chalk.bgYellow.black(` ${h} `)} ${text}`);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + `${getTimestamp()} ${h} ${text}`, function(error) {
				if (error) throw error;
			});
		}
	}
	
	error(text, h = 'ERROR') {
		console.log(`${getTimestamp()} ${chalk.bgRed.white(` ${h} `)} ${text}`);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + `${getTimestamp()} ${h} ${text}`, function(error) {
				if (error) throw error;
			});
		}
	}

	log(text) {
		console.log(`${getTimestamp()} ${text}`);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + `${getTimestamp()} ${text}`, function(error) {
				if (error) throw error;
			});
		}
	}
	
	logCommand(guildName, userName, commandName, channelName) {
		var log, logOut;
		if (guildName) {
			log = `${getTimestamp()} ${chalk.bold.green(userName)} @ ${chalk.bold.blue(guildName)} in ${chalk.bold.cyan(`#${channelName}`)} ${chalk.bold.yellow('»')} ${commandName}`;
			logOut = `${getTimestamp()} ${userName} @ ${guildName} in #${channelName} » ${commandName}`;
		}
		else {
			log = `${getTimestamp()} ${chalk.bold.green(userName)} ${chalk.bold.yellow('»')} ${commandName}`;
			logOut = `${getTimestamp()} ${userName} » ${commandName}`;
		}	
		console.log(log);
		if (this.logFile) {
			fs.appendFile(this.logFile, "\n" + logOut, function(error) {
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