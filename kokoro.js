const Discord = require('discord.js');
const Shell = require('shelljs');
const fs = require('fs');

const Logger = require('./modules/Logger.js');
const Handler = require('./modules/Handler.js');
const Setup = require('./setup.js');

Setup.init();
Logger.infoGeneric('Initializing...');

const Kokoro = new Discord.Client();

Kokoro
    .on('warn', w => Logger.warn(w))
    .on('error', e => Logger.error(e))
    .on('disconnect', () => Logger.error('CLIENT DISCONNECTED', 'WARN'))
    .on('reconnecting', () => Logger.warn('RECONNECTING CLIENT'))
    .on('resume', () => Logger.info('CLIENT RECONNECTED'))
    .on('ready', () => Logger.info('CLIENT CONNECTED'));

Kokoro.Bot = {
    commands: {},
    config: require('./config.json'),
    logger: Logger,
    help: Handler.help,
    shutdown: shutdown,
    update: update,
    restart: restart,
    Error: Handler.Error,
    send: (msg, icon, content) => {
        return msg.send(`${icon} » ${content}`);
    }
};

Kokoro.Handler = {
    checkPermissions: Handler.checkPermissions,
    loadCommands: Handler.loadCommands,
    getCommand: Handler.getCommand
};

Kokoro.Handler.loadCommands('./commands')
    .then(cmd => {
        Kokoro.Bot.commands = cmd;
        Kokoro.login(Kokoro.Bot.config.token);
    })
    .catch(err => {
        Logger.error(err.stack);
    });

Kokoro.on('message', msg => {
    if (msg.author.bot) return;

    const cfg = Kokoro.Bot.config;
    const cmd = Kokoro.Bot.commands;

    if (!msg.content.startsWith(cfg.prefix)) return;

    Kokoro.Handler.getCommand(msg, cmd, cfg.prefix)
        .then(obj => {
            if (!Kokoro.Handler.checkPermissions(msg, obj.cmd, cfg, true)) return;
            if (!obj.cmd.run)
                return Logger.warn('Command has no run action set!');
            msg.channel.startTyping();
            Logger.logCommand(msg.channel.guild === undefined ? null: msg.channel.guild.name, 
                msg.author.username, msg.content.slice(cfg.prefix.length), msg.channel.name);
            obj.cmd.run(Kokoro, msg, obj.arg);
            msg.channel.stopTyping(true);
        })
        .catch(err => {
            if (err == null) return;
            msg.channel.send(Kokoro.Bot.config.reply.SysErrorMin);
            var out = `An error occured in "${err.source}" where:\n${err.stack}`;
            fs.writeFile("./error.log", `Last exception occured at ${new Date()}\n${out}`, (err) => {
                if (err) return console.log(err);
            });
            Logger.error(out);
        });
});

function shutdown() {
    Logger.warn('Shutting down');
    Kokoro.destroy()
        .then(() => {
            process.exit();
        })
        .catch(e => {
            Logger.error('An error has occured...');
            console.log(e);
        });
};

function update(msg) {
    if (!Shell.which('git')) {
        Shell.echo('Sorry, updating requires "git" to be installed.');
        Shell.exit(1);
    }
    Shell.exec('./scripts/update.sh', (code, stdout, stderr) => {
        if (stdout) {
            msg.channel.send(stdout, {code: 'md'});
        }
        else if (stderr) {
            msg.channel.send(stderr, {code: 'md'});
        }
    });
}

function restart() {
    Logger.warn('Restarting');
    Kokoro.destroy()
        .then(() => {
            require("child_process").spawn(process.argv.shift(),
                process.argv, {
                    cwd: process.cwd(),
                    detached: true,
                    stdio: "inherit"
                });
            process.exit();
        })
        .catch(e => {
            Logger.error('An error has occured...');
            console.log(e);
        });
};

process.on('SIGINT', () => { shutdown() });
process.on('SIGUSR1', () => { shutdown() });
process.on('SIGUSR2', () => { shutdown() });

process.on('uncaughtException', (err) => { 
    Logger.error('An error has occured...');
    console.log(err);    
});