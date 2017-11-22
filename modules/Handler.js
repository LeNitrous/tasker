const fs = require('fs');
const Command = require('../models/Command.js');
const Group = require('../models/Group.js');

const root = '../';

module.exports = {
    LoadCommands(dir) {
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
                        let prop = require(`${root}${dir}/${file}`);
                        let name = file.split('.')[0];
                        arr[name] = new Command();
                        arr[name].help = prop.help || '';
                        arr[name].args = prop.args || [''];
                        arr[name].preq = prop.preq || [''];
                        arr[name].perm = prop.perm || [''];
                        arr[name].run = prop.run;
                    });
            
                    dirs.forEach(d => {
                        arr[d] = new Group();
                        let files = fs.readdirSync(`${dir}/${d}`).filter(o => { return fs.lstatSync(`${dir}/${d}/${o}`).isFile() });
                        files.forEach(file => {
                            let prop = require(`${root}${dir}/${d}/${file}`);
                            let name = file.split('.')[0];
                            arr[d][name] = new Command();
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
                };
            });
        })        
    },

    ReloadCommand(cmd, dir, cmds) {
        com = cmd.join('/');
        dir = root + dir;
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`${dir}/${com}`)];
                let req = require(`${dir}/${com}.js`);
                let Commands = cmds;
                let prop, ret;
                if (cmd.length == 2) {
                    prop = Commands[cmd[0]][cmd[1]];
                    ret = [cmd[0], cmd[1]];
                }
                else {
                    prop = Commands[cmd[0]];
                    ret = [cmd[0]];
                }
                prop.help = req.help || '';
                prop.args = req.args || [''];
                prop.preq = req.preq || [''];
                prop.perm = req.perm || [''];
                prop.run = req.run;
                resolve(ret);
            }
            catch (e) {
                reject(e);
            }
        }) 
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

    CheckPermissions(msg, com, conf) {
        let reply = conf.reply;
        let owner = conf.owner;
        let aggr = conf.aggressive;
        let chan = msg.channel;
        let member = msg.member;
        let author = msg.author;
        let guild = msg.guild;
        let preq = com.preq;
        let perm = com.perm;
    
        if (preq.contains("DMChatOnly") && chan.guild != undefined) {
            chan.send(reply.PermsDMChat);
            return false;
        };
        if (preq.contains("ServerOnly") && chan.guild == undefined) {
            chan.send(reply.PermsServer);
            return false;
        };
        if (preq.contains("BotOwnerOnly") && author.id != owner) {
            if (aggr)
                chan.send(reply.PermsBotOwner);
            return false;
        };
        if (preq.contains("HasElevatedPerms") && member.permissions.has(perm, true)) {
            if (aggr)
                chan.send(reply.PermsElevatedPerms);
            return false;
        };
        if (preq.contains("ServerOwnerOnly") && auth.id != guild.ownerID) {
            if (aggr)
                chan.send(reply.PermsServerOwner);
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