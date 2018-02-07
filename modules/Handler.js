const fs = require('fs');

class Command {
    constructor(data) {
        this.name = data.name;
        this.desc = data.desc || '';
        this.help = data.help || '';
        this.preq = data.preq || [];
        this.perm = data.perm || [];
        this.run = data.run;
    }
}

class Group {
    constructor(data) {
        this.name = data.name || 'unnamed';
        this.desc = data.desc || '';
        this.preq = [];
        this.perm = [];
    }
}

class ExecutionError extends Error {
    constructor(src, msg) {
        super(msg);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.source = src;
    }
};

module.exports = {
    Command: Command,
    Group: Group,
    Error: ExecutionError,
    loadCommands: (dir) => {
        return new Promise((resolve, reject) => {
            var set = {};
            fs.readdir(dir, (err, item) => {
                if (err) reject(new Error(err));
                try {
                    var com = item.filter(obj => { return fs.lstatSync(`${dir}/${obj}`).isFile() })
                        .filter(obj => { return obj.endsWith('.js') });
                    var grp = item.filter(obj => { return fs.lstatSync(`${dir}/${obj}`).isDirectory() });
                    com.forEach(obj => {
                        var prop = require(`../${dir}/${obj}`);
                        var name = obj.split('.').shift();
                        set[name] = new Command(prop)
                    });
                    grp.forEach(group => {
                        let opt = require(`../${dir}/${group}/${group}.json`);
                        set[group] = new Group(opt);
                        fs.readdir(`${dir}/${group}`, (err, item) => {
                            if (err) reject(new Error(err));
                            var com = item.filter(obj => { return obj.endsWith('.js') });
                            com.forEach(obj => {
                                var prop = require(`../${dir}/${group}/${obj}`);
                                var name = obj.split('.').shift();
                                set[group][name] = new Command(prop);
                                set[group].preq.push.apply(set[group].preq, prop.preq);
                                set[group].perm.push.apply(set[group].perm, prop.perm);
                            });
                        });
                    });
                    resolve(set);
                }
                catch (err) {
                    reject(new Error(err));
                };
            })
        })
    },
    getCommand: (msg, com, pre) => {
        return new Promise((resolve, reject) => {
            var args = msg.content.split(' ');
            var arg1 = args.shift().slice(pre.length);
            var cmd;
            if (com.hasOwnProperty(arg1)) {
                try {
                    if (com[arg1] instanceof Group) {
                        var arg2 = args.shift();
                        if (com[arg1].hasOwnProperty(arg2))
                            cmd = com[arg1][arg2]
                    }
                    else if (com[arg1] instanceof Command) {
                        cmd = com[arg1];
                    };
                    if (cmd == undefined) return;
                    resolve({
                        cmd: cmd,
                        arg: args
                    });
                }
                catch (err) {
                    reject(new ExecutionError("CommandHandler", err));
                };
            };
        })
    },
    checkPermissions: (msg, cmd, cfg, shouldSend) => {
        var preq = cmd.preq;
        var perm = cmd.perm;
        if (preq.contains("DMChatOnly") && msg.channel.guild != undefined) {
            if (shouldSend) msg.channel.send(cfg.reply.PermsDMChat);
            return false;
        };
        if (preq.contains("ServerOnly") && msg.channel.guild == undefined) {
            if (shouldSend) msg.channel.send(cfg.reply.PermsServer);
            return false;
        };
        if (preq.contains("BotOwnerOnly") && !cfg.owner.contains(author.id)) {
            if (!cfg.peaceful)
                if (shouldSend) msg.channel.send(cfg.reply.PermsBotOwner);
            return false;
        };
        if (preq.contains("HasElevatedPerms")) {
            if (msg.guild)
                if (msg.member.permissions.has(perm, true)) {
                    if (!peaceful)
                        if (shouldSend) chan.send(reply.PermsElevatedPerms);
                    return false;
                };
        };
        if (preq.contains("ServerOwnerOnly")) {
            if (msg.guild)
                if (msg.author.id != msg.guild.ownerID) {
                    if (!peaceful)
                        if (shouldSend) chan.send(reply.PermsServerOwner);
                    return false;
                };
        };
        if (preq.contains("UseWhitelist") && chan.guild != undefined) {
            if (!cfg.whitelist.contains(msg.guild.id))
                return false;
        };
        return true;
    },
    help(bot, msg, args) {
        const Commands = bot.Bot.commands;
        const Config = bot.Bot.config;

        var helpMenu = [];
        var ignoreProps = ['name', 'desc', 'preq', 'perm'];

        const footer = `\n- Type "${Config.prefix}help <command>" for more details.`;

        if (args.length < 1) {
            helpMenu.push(`# ${bot.user.username} Commands:`)
            for (var prop in Commands) {
                if (Commands.hasOwnProperty(prop) && bot.Handler.checkPermissions(msg, Commands[prop], Config, false)) {
                    if (Commands[prop] instanceof Command)
                        helpMenu.push(`> ${padString(prop, 15)}\t${Commands[prop].desc}`);
                    else if (Commands[prop] instanceof Group) {
                        helpMenu.push(``);
                        helpMenu.push(`# ${Commands[prop].name}:`);
                        for (var innerProp in Commands[prop]) {
                            if (Commands[prop][innerProp] instanceof Command)
                                helpMenu.push(`> ${padString(`${prop} ${innerProp}`, 15)}\t${Commands[prop][innerProp].desc}`);
                        }
                    }
                }
            }
            helpMenu.push(footer);
        }
        else if (args.length == 1) {
            if (Commands[args[0]] instanceof Command) {
                if (!bot.Handler.checkPermissions(msg, Commands[args[0]], Config, false))
                    return;
                var com = Commands[args[0]];
                var name = args[0];
                var help = (com.help != '') ? com.help : com.desc;
                helpMenu.push(`# ${com.name}\n- Help: ${help}\n\n- Usage: ${Config.prefix}${name}`);
            }
            else if (Commands[args[0]] instanceof Group) {
                helpMenu.push(`# ${Commands[args[0]].name}:`);
                for (var prop in Commands[args[0]]) {
                    if (Commands[args[0]].hasOwnProperty(prop)) {
                        if (Commands[args[0]][prop] instanceof Command)
                            if (bot.Handler.checkPermissions(msg, Commands[args[0]][prop], Config, false))
                                helpMenu.push(`> ${padString(`${args[0]} ${prop}`, 15)}\t${Commands[args[0]][prop].desc}`);
                    };
                };
                helpMenu.push(footer);
            };
        }
        else if (args.length == 2) {
            if (Commands.hasOwnProperty(args[0])) {
                if (Commands[args[0]][args[1]].preq && Commands[args[0]][args[1]].perm)
                    if (!bot.Handler.checkPermissions(msg, Commands[args[0]][args[1]], Config, false))
                        return;
                var com = Commands[args[0]][args[1]];
                var name = args.join(' ');
                var help = (com.help != '') ? com.help : com.desc;
                helpMenu.push(`# ${com.name}\n- Help: ${help}\n\n- Usage: ${Config.prefix}${name}`);
            };
        };

        var helpText = helpMenu.join('\n');
        if (helpText.length > 1950) {
            var result = Discord.Util.splitMessage(helpText);
            result.forEach(block => {
                msg.channel.send(block, {code: 'md'});
            });
        }
        else if (helpText.length != 0)
            msg.author.send(helpText, {code: 'md'});
    }
}

function padString(string, padLength) {
    if (string.length > padLength) throw new Error('Invalid size.');
    var num = padLength - string.length;
    for (var i = 0; i < num; i++) {
        string += ' ';
    };
    return string;
};

Array.prototype.contains = (needle) => {
    for (i in this) {
       if (this[i] == needle) return true;
    }
    return false;
 };