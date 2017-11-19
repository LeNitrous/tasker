const Discord = require('discord.js');
const logger = require('./modules/Logger.js')
const fs = require('fs');

const dirCMD = './commands';
const dirConf = './config.json';

const ConfigDefaults = {
    token: "",
    owner: "",
    prefix: "]",
    reply : {
        PermsServer: "⚠️ | This command is only available in guilds.",
        PermsDMChat: "⚠️ | This command is only available in direct messages.",
        PermsBotOwner: "⚠️ | You don't have permission to use this command.",
        PermsElevatedPerms: "⚠️ | You don't have permission to use this command.",
        PermsServerOwner: "⚠️ | You don't have permission to use this command.",
        Error: "💢 | An error has occured!",
    }
};

if (!fs.existsSync(dirCMD)) {
    logger.warn('Commands directory doesn\'t exist! Creating one...');
    fs.mkdirSync(dirCMD);
};

if (!fs.existsSync(dirConf)) {
    logger.warn('Config file doesn\'t exist! Creating one...');
    fs.writeFileSync(dirConf, JSON.stringify(ConfigDefaults));
}

const Kokoro = new Discord.Client();

Kokoro.Config = require(dirConf);
Kokoro.LoadCommands = (dir) => {
    return new Promise((resolve, reject) => {
        let arr = {};
        fs.readdir(dir, (e, f) => {
            if (e) reject(new Error(e));
            try {
                let files, dirs;
                files = f.filter(o => { return fs.lstatSync(`${dir}/${o}`).isFile() });
                files = files.filter(o => { return o.endsWith('.js') });
                dirs = f.filter(o => { return fs.lstatSync(`${dir}/${o}`).isDirectory() });
        
                files.forEach(file => {
                    let prop = require(`${dir}/${file}`);
                    let name = file.split('.')[0];
                    arr[name] = {};
                    arr[name].help = prop.help || '';
                    arr[name].args = prop.args || [''];
                    arr[name].preq = prop.preq || [''];
                    arr[name].perm = prop.perm || [''];
                    arr[name].run = prop.run;
                });
        
                dirs.forEach(d => {
                    arr[d] = [];
                    let files = fs.readdirSync(`${dir}/${d}`).filter(o => { return fs.lstatSync(`${dir}/${d}/${o}`).isFile() });
                    files.forEach(file => {
                        let prop = require(`${dir}/${d}/${file}`);
                        let name = file.split('.')[0];
                        arr[d][name] = {};
                        arr[d][name].help = prop.help || '';
                        arr[d][name].args = prop.args || [''];
                        arr[d][name].preq = prop.preq || [''];
                        arr[d][name].perm = prop.perm || [''];
                        arr[d][name].run = prop.run;
                    });
                });
                resolve(arr);
            }
            catch (e) {
                reject(new Error(e));
            }
        });
    })
}

var config = Kokoro.Config;

if (config.token.length == 0)
throw new Error('Token has not been set!');

if (config.owner.length == 0)
throw new Error('Owner ID has not been set!');

Kokoro
    .on('warn', w => logger.warn(w))
    .on('error', e => logger.error(e))
    .on('disconnect', () => logger.error('CLIENT DISCONNECTED', 'WARN'))
    .on('ready', () => logger.info('CLIENT CONNECTED'));

logger.infoGeneric("Loading commands...");

Kokoro.LoadCommands(dirCMD)
    .then(d => {
        Kokoro.Commands = d;
        console.log(d);
        Kokoro.login(config.token);
    });

Kokoro.on('message', m => {
    if (m.author.bot) return;

    let prefix = config.prefix;
    let Commands = Kokoro.Commands;

    if (!m.content.startsWith(prefix)) return;

    let arr = m.content.split(' ');
    let cmd = arr.shift().slice(prefix.length);
    let sub, args, com;

    if (!Commands.hasOwnProperty(cmd)) return;

    try {
        if (Commands[cmd] instanceof Array) {
            sub = arr.shift();
            args = arr;
            com = Commands[cmd][sub];
        }
        else if (Commands[cmd] instanceof Object) {
            args = arr;
            com = Commands[cmd];
        }
        if (!CheckPermissions(m, com)) return;
        com.run(Kokoro, m, args);
    }
    catch (e) {
        logger.error(e.stack);
        m.channel.send(config.reply.Error);
    }

    logger.logCommand(m.channel.guild === undefined ? null: m.channel.guild.name, 
        m.author.username, m.content.slice(prefix.length), m.channel.name);

});

Array.prototype.contains = function ( needle ) {
    for (i in this) {
       if (this[i] == needle) return true;
    }
    return false;
 }

function CheckPermissions(m, c) {
    let reply = config.reply;
    let owner = config.owner;
    let chan = m.channel;
    let member = m.member;
    let author = m.author;
    let guild = m.guild;
    let preq = c.preq;
    let perm = c.perm;

    //
    //  DMChatOnly - Direct Messages
    //  ServerOnly - Guild Messages
    //  BotOwnerOnly - Bot Owner Messages
    //  HasElevatedPerms - Authors with Permissions
    //  ServerOwnerOnly - Server Owner Messages
    //

    if (preq.contains("DMChatOnly") && chan.guild != undefined) {
        chan.send(reply.PermsDMChat);
        return false;
    };
    if (preq.contains("ServerOnly") && chan.guild == undefined) {
        chan.send(reply.PermsServer);
        return false;
    };
    if (preq.contains("BotOwnerOnly") && author.id != owner) {
        chan.send(reply.PermsBotOwner);
        return false;
    };
    if (preq.contains("HasElevatedPerms") && member.permissions.has(perm, true)) {
        chan.send(reply.PermsElevatedPerms);
        return false;
    };
    if (preq.contains("ServerOwnerOnly") && auth.id != guild.ownerID) {
        chan.send(reply.PermsServerOwner);
        return false;
    };

    return true;
};