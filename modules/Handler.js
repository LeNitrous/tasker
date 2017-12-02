const fs = require('fs');

class Command {
    constructor(data) {
        this.name = data.name || 'unnamed';
        this.help = data.help || '';
        this.preq = data.preq || [''];
        this.perm = data.perm || [''];
        this.run = data.run;
    }
}

class Group extends Object {
    constructor() {
        super();
    }
}

module.exports = {
    Command: Command,
    Group: Group,

    LoadCommands(dir) {
        return new Promise((resolve, reject) => {
            let list = {};
            fs.readdir(dir, (err, file) => {
                if (err) reject(new Error(e));
                try {
                    let files, folders;
                    files = file.filter(obj => { return fs.lstatSync(`${dir}/${obj}`).isFile() });
                    files = files.filter(obj => { return obj.endsWith('.js') });
                    folders = file.filter(obj => { return fs.lstatSync(`${dir}/${obj}`).isDirectory() });

                    files.forEach(obj => {
                        let prop = require(`../${dir}/${obj}`);
                        let com = obj.split('.')[0];
                        list[com] = new Command(prop);
                    });

                    folders.forEach(obj => {
                        list[obj] = new Group();
                        let files = fs.readdirSync(`${dir}/${obj}`).filter(file => { return fs.lstatSync(`${dir}/${obj}/${file}`).isFile() });
                        files.forEach(file => {
                            let prop = require(`../${dir}/${obj}/${file}`);
                            let com = file.split('.')[0];
                            list[obj][com] = new Command(prop);
                        });
                    });
                    resolve(list);
                }
                catch (err) {
                    console.log(err);
                    reject(new Error(err));
                }
            });
        });
    },

    ReloadCommand(cmd, dir, list) {
        com = cmd.join('/');
        dir = '../' + dir;
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`${dir}/${com}`)];
                let req = require(`${dir}/${com}.js`);
                let Commands = list;
                let prop, ret;
                if (cmd.length == 2) {
                    prop = Commands[cmd[0]][cmd[1]];
                    ret = [cmd[0], cmd[1]];
                }
                else {
                    prop = Commands[cmd[0]];
                    ret = [cmd[0]];
                }
                delete prop;
                prop = new Command(req);
                resolve(ret);
            }
            catch (err) {
                reject(e);
            };
        });
    },

    GetCommand(msg, coms, pref) {
        return new Promise((resolve, reject) => {
            let arr = msg.content.split(' ');
            let arg1, arg2, args, cmd, par;
            arg1 = arr.shift().slice(pref.length);
            if (!coms.hasOwnProperty(arg1)) reject();
            try {
                if (coms[arg1] instanceof Group) {
                    arg2 = arr.shift();
                    args = arr;
                    par = coms[arg1]
                    cmd = coms[arg1][arg2];
                }
                else if (coms[arg1] instanceof Command) {
                    args = arr;
                    cmd = coms[arg1];
                }
                resolve([cmd, args, par]);
            }
            catch (e) {
                reject(new Error('Caught Command Expection.\n' + e));
            }
        }); 
    },

    CheckPermissions(msg, com, conf, shouldSend) {
        let reply = conf.reply;
        let owner = conf.owner;
        let peaceful = conf.peaceful;
        let chan = msg.channel;
        let member = msg.member;
        let author = msg.author;
        let guild = msg.guild;
        let preq = com.preq;
        let perm = com.perm;
    
        if (preq.contains("DMChatOnly") && chan.guild != undefined) {
            if (shouldSend)  chan.send(reply.PermsDMChat);
            return false;
        };
        if (preq.contains("ServerOnly") && chan.guild == undefined) {
            if (shouldSend) chan.send(reply.PermsServer);
            return false;
        };
        if (preq.contains("BotOwnerOnly") && !owner.contains(author.id)) {
            if (!peaceful)
                if (shouldSend) chan.send(reply.PermsBotOwner);
            return false;
        };
        if (preq.contains("HasElevatedPerms") && member.permissions.has(perm, true)) {
            if (!peaceful)
                if (shouldSend) chan.send(reply.PermsElevatedPerms);
            return false;
        };
        if (preq.contains("ServerOwnerOnly") && auth.id != guild.ownerID) {
            if (!peaceful)
                if (shouldSend) chan.send(reply.PermsServerOwner);
            return false;
        };
    
        return true;        
    }
};

Array.prototype.contains = function ( needle ) {
    for (i in this) {
       if (this[i] == needle) return true;
    }
    return false;
 };