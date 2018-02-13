const Discord = require('discord.js');
const Shell = require('shelljs');
const config = require('./config.json');
const cron = require('cron');
const fs = require('fs');

const Logger = require('./modules/Logger.js');
const Bandori = require('./modules/BandoriHandler.js');

Logger.infoGeneric('Initializing...');

if (config.token.length == 0)
    return Logger.error('Bot token is not yet set! Please set one in your "config.json". Your token can be found at: https://discordapp.com/developers/applications/me');
if (config.owner.length == 0)
    Logger.warn('There is currently no owner. Please set one in your "config.json". The bot will start normally but you cannot access any administrative commands.');
if (!fs.existsSync("./data/guild.json"))
    fs.writeFileSync("./data/guild.json", JSON.stringify([]));

const Kokoro = new Discord.Client();

Kokoro
    .on('warn', w => Logger.warn(w))
    .on('disconnect', () => Logger.error('CLIENT DISCONNECTED', 'WARN'))
    .on('reconnecting', () => Logger.warn('RECONNECTING CLIENT'))
    .on('resume', () => Logger.info('CLIENT RECONNECTED'))
    .on('error', event => {
        if (event == null) return;
        if (event.msg && event.err) {
            Kokoro.Bot.send(event.msg.channel, "💢", "Oops! That wasn't supposed to happen");
            var out = `An error occured in "${event.err.source}" where:\n${event.err.stack}`;
            fs.writeFile("./error.log", `Last exception occured at ${new Date()}\n${out}`, (err) => {
                if (err) return console.error(err);
            });
            Logger.error(out);
            event.msg.channel.stopTyping(true);
        }
        else {
            Logger.error(event.message);
        };
    })
    .on('ready', () => {
        Logger.info('CLIENT CONNECTED')
        Kokoro.user.setActivity(`${Kokoro.Bot.config.prefix}help`, {
            type: "LISTENING"
        });
    });

Kokoro.Handler = require('./modules/Handler.js');
Kokoro.Timers = [

    // Daily (every Midnight JST)
    new cron.CronJob({
        cronTime: "00 00 00 * * *",
        onTick: () => {
            checkBirthday();
        },
        start: false,
        timeZone: "Asia/Tokyo"
    }),

    // Daily (every 2PM JST)
    new cron.CronJob({
        cronTime: "00 00 14 * * *",
        onTick: () => {
            checkEvent();
        },
        start: false,
        timeZone: "Asia/Tokyo"
    })
]

function isToday(date) {
    var today = new Date();
    var target = new Date(date);
    if (today.getMonth() == target.getMonth() && today.getDate() == target.getDate())
        return true;
    else
        return false;
}

Kokoro.Bot = {
    commands: {},
    config: config,
    logger: Logger,
    help: Kokoro.Handler.help,
    shutdown: shutdown,
    update: update,
    restart: restart,
    Error: error,
    send: send
};

Kokoro.Handler.loadCommands('./commands')
    .then(cmd => {
        Kokoro.Bot.commands = cmd;
        Kokoro.login(Kokoro.Bot.config.token);
        Kokoro.Timers.forEach(timer => {
            timer.start();
        });
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
            Kokoro.emit('error', {
                msg: msg,
                err: err
            });
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
}

function error(msg, src, err) {
    Kokoro.emit('error', {
        msg: msg,
        err: new Kokoro.Handler.Error(src, err)
    });
}

function send(msg, icon, content) {
    return msg.send(`${icon} » ${content}`);
}

function checkBirthday() {
    var garupa = require('./data/bandori.json');
    var settings = require('./data/guild.json');
    var birthday = garupa.birthdays.filter(elem =>
        isToday(parseInt(elem.date))
    ).shift();
    if (birthday) {
        settings.forEach(elem => {
            if (elem.bandori.birthdayAnnounceChannel) {
                Kokoro.guilds.find('id', elem.guild)
                    .channels.find('id', elem.bandori.birthdayAnnounceChannel)
                    .send(birthday.message,
                    {files: [
                        {attachment: birthday.image, name: "image.jpg"}
                    ]});
            }
        });
    };
}

function checkEvent() {
    var garupa = require('./data/bandori.json');
    Bandori.Api.getCurrentEvent()
        .then(event => 
            Promise.all([
                event.getCards(),
                event.getMusic(),
                event.getLocale()
            ])
            .then(response => {
                if (!garupa.event)
                    garupa.event = {};
                if (garupa.event.id != event.id) {
                    var settings = require('./data/guild.json');
                    settings.forEach(elem => {
                        if (elem.bandori.eventAnnounceChannel) {
                            var channel = Kokoro.guilds.find('id', elem.guild)
                                .channels.find('id', elem.bandori.eventAnnounceChannel);
                            channel.send("**New Event!**");
                            Bandori.sendEvent(channel, event, response[0], response[1], response[2]);
                        }
                    });
                }
                if (garupa.event.id != event.id) {
                    garupa.event = {
                        id: event.id,
                        start: event.start,
                        end: event.end
                    };
                }
                fs.writeFile('./data/bandori.json', JSON.stringify(garupa), (err) => {
                    if (err) Logger.error(error.stack);
                });
            })
        )
        .catch(error => {
            Logger.error(error.stack);
        });
}

process.on('SIGINT', () => { shutdown() });
process.on('SIGUSR1', () => { shutdown() });
process.on('SIGUSR2', () => { shutdown() });

process.on('uncaughtException', (err) => { 
    Logger.error('An error has occured...');
    console.log(err);    
});