const Discord = require('discord.js');
const logger = require('./modules/Logger.js');
const fs = require('fs');

const dirCMD = './commands';
const dirConf = './config.json';
const dirData = './data';

const ConfigDefaults = {
    token: "",
    owner: "",
    prefix: "]",
    reply : {
        PermsServer: "⚠️ » This command is only available in guilds.",
        PermsDMChat: "⚠️ » This command is only available in direct messages.",
        PermsBotOwner: "⚠️ » You don't have permission to use this command.",
        PermsElevatedPerms: "⚠️ » You don't have permission to use this command.",
        PermsServerOwner: "⚠️ » You don't have permission to use this command.",
        Error: "💢 » An error has occured!",
        Reload: "🔁 » Reloaded `{0}` successfully."
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
};

Kokoro.ReloadCommand = (cmd) => {
    com = cmd.join('/');
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`${dirCMD}/${com}`)];
            let req = require(`${dirCMD}/${com}.js`);
            let Commands = Kokoro.Commands;
            let prop, ret;
            if (cmd.length == 2) {
                prop = Commands[cmd[0]][cmd[1]];
                ret = [cmd[0], cmd[1]];
            }
            else {
                prop = Commands[cmd[0]];
                ret = [cmd[0]];
            }
            prop.help = req.help;
            prop.args = req.args;
            prop.preq = req.preq;
            prop.perm = req.perm;
            prop.run = req.run;
            resolve(ret);
        }
        catch (e) {
            reject(e);
        }
    })
};

Kokoro.GetCommand = (msg, coms, pref) => {
    return new Promise((resolve, reject) => {
        let arr = msg.content.split(' ');
        let arg1, arg2, args, cmd, par;
        arg1 = arr.shift().slice(pref.length);
        if (!coms.hasOwnProperty(arg1)) reject();
        try {
            if (coms[arg1] instanceof Array) {
                arg2 = arr.shift();
                args = arr;
                par = coms[arg1]
                cmd = coms[arg1][arg2];
            }
            else if (coms[arg1] instanceof Object) {
                args = arr;
                cmd = coms[arg1];
            }
            resolve([cmd, args, par]);
        }
        catch (e) {
            reject(new Error('Caught Command Expection.\n' + e));
        }
    });
};

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
    });

Kokoro.on('message', m => {
    if (m.author.bot) return;

    let prefix = config.prefix;
    let Commands = Kokoro.Commands;

    if (!m.content.startsWith(prefix)) return;
    m.channel.startTyping();
    Kokoro.GetCommand(m, Commands, prefix)
        .then(arr => {
            let cmd = arr[0];
            let args = arr[1];
            if (!CheckPermissions(m, cmd)) return;
            if (!cmd.run)
                return logger.warn('Command has no run action set!');
            cmd.run(Kokoro, m, args);
        })
        .catch(err => {
            logger.error(err);
        });
    m.channel.stopTyping(true);
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
})

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