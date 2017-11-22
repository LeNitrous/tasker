const Discord = require('discord.js');
const Handler = require('./modules/Handler.js');
const logger = require('./modules/Logger.js');
const fs = require('fs');

const dirCMD = './commands';
const dirConf = './config.json';
const dirData = './data';

const ConfigDefaults = {
    token: "",
    owner: "",
    prefix: "]",
    aggressive: true,
    reply : {
        PermsServer: "⚠️ » This command is only available in guilds.",
        PermsDMChat: "⚠️ » This command is only available in direct messages.",
        PermsBotOwner: "🚫 » You don't have permission to use this command.",
        PermsElevatedPerms: "🚫 » You don't have permission to use this command.",
        PermsServerOwner: "🚫 » You don't have permission to use this command.",
        Error: "💢 » An error has occured!",
        Reload: "🔁 » Reloaded `{0}` successfully.",
        ReloadNotFound: "⚠️ » `{0}` doesn't exist",
        StatusBusy: "Reloading!"
    }
};

if (!fs.existsSync(dirCMD)) {
    logger.warn('Commands directory doesn\'t exist! Creating one...');
    fs.mkdirSync(dirCMD);
};

if (!fs.existsSync(dirData)) {
    logger.warn('Data directory doesn\'t exist! Creating one...');
    fs.mkdirSync(dirData); 
};

if (!fs.existsSync(dirConf)) {
    logger.warn('Config file doesn\'t exist! Creating one...');
    fs.writeFileSync(dirConf, JSON.stringify(ConfigDefaults));
};

const Kokoro = new Discord.Client();

Kokoro.Config = require(dirConf);
Kokoro.Data = dirData;
Kokoro.ShouldRunCommands = true;
Kokoro.CommandsDir = dirCMD;
Kokoro.ConfigDir = dirConf;
Kokoro.Commands = {};

Kokoro.LoadCommands = Handler.LoadCommands;
Kokoro.ReloadCommand = Handler.ReloadCommand;
Kokoro.GetCommand = Handler.GetCommand;
Kokoro.CheckPermissions = Handler.CheckPermissions;

Kokoro.Shutdown = () => {
    logger.infoGeneric('Shutting down bot...');
    Kokoro.destroy()
        .then(() => {
            process.exit();
        })
        .catch(e => {
            console.log(e);
            process.exit();
        });
};

var config = Kokoro.Config;

if (config.token.length == 0)
throw new Error('Token has not been set!\nThe bot will not be able to login. Please your bot\'ts token in your config.json.');

if (config.owner.length == 0)
throw new Error('Owner ID has not been set!\nYou will not be able to access administrator commands. Please set your Client ID in your config.json.');

Kokoro
    .on('warn', w => logger.warn(w))
    .on('error', e => logger.error(e))
    .on('disconnect', () => logger.error('CLIENT DISCONNECTED', 'WARN'))
    .on('ready', () => logger.info('CLIENT CONNECTED'));

logger.infoGeneric("Loading commands...");

Kokoro.LoadCommands(dirCMD)
    .then(d => {
        Kokoro.Commands = d;
        Kokoro.login(config.token);
    })
    .catch(e => {
        console.log(e);
    });

Kokoro.on('message', m => {
    if (!Kokoro.ShouldRunCommands) return;
    if (m.author.bot) return;

    let prefix = config.prefix;
    let Commands = Kokoro.Commands;

    if (!m.content.startsWith(prefix)) return;
    Kokoro.GetCommand(m, Commands, prefix)
        .then(arr => {
            let cmd = arr[0];
            let args = arr[1];
            if (!Kokoro.CheckPermissions(m, cmd, config)) return;
            if (!cmd.run)
                return logger.warn('Command has no run action set!');
            cmd.run(Kokoro, m, args);
        })
        .catch(err => {
            logger.error(err);
        });
    logger.logCommand(m.channel.guild === undefined ? null: m.channel.guild.name, 
        m.author.username, m.content.slice(prefix.length), m.channel.name);
});

process.on('SIGINT', () => {
    Kokoro.Shutdown();
});

process.on('SIGTERM', () => {
    Kokoro.Shutdown();
});

process.on('SIGHUP', () => {
    Kokoro.Shutdown();
});

process.on('SIGBREAK', () => {
    Kokoro.Shutdown();
});