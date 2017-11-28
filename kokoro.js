const Discord = require('discord.js');
const Handler = require('./modules/Handler.js');
const Logger = require('./modules/Logger.js');
const Setup= require('./setup.js');

Logger.infoGeneric('Initializing...')
Setup.init();

const Kokoro = new Discord.Client();

Kokoro.Commands = {};
Kokoro.Config = require('./config.json');
Kokoro.Data = './data';

Kokoro.ShouldRunCommands = true;
Kokoro.CheckPermissions = Handler.CheckPermissions;
Kokoro.ReloadCommand = Handler.ReloadCommand;
Kokoro.LoadCommands = Handler.LoadCommands;
Kokoro.GetCommand = Handler.GetCommand;
Kokoro.Log = Logger;

Kokoro
    .on('warn', w => Logger.warn(w))
    .on('error', e => Logger.error(e))
    .on('disconnect', () => Logger.error('CLIENT DISCONNECTED', 'WARN'))
    .on('ready', () => Logger.info('CLIENT CONNECTED'));

Kokoro.LoadCommands('./commands')
    .then(com => {
        Kokoro.Commands = com;
        Kokoro.login(Kokoro.Config.token);
    })
    .catch(err => {
        Logger.error(err);
    });

Kokoro.on('message', msg => {
    if (!Kokoro.ShouldRunCommands) return;
    if (msg.author.bot) return;

    let Prefix = Kokoro.Config.prefix;
    let Commands = Kokoro.Commands;

    if (!msg.content.startsWith(Prefix)) return;

    Kokoro.GetCommand(msg, Commands, Prefix)
        .then(obj => {
            let com = obj[0];
            let arg = obj[1];
            if (!Kokoro.CheckPermissions(msg, com, Kokoro.Config)) return;
            if (!com.run)
                return Logger.warn('Command has no run action set!');
            com.run(Kokoro, msg, arg);
        })
        .catch(err => {
            Logger.error(err);
        });

    Logger.logCommand(msg.channel.guild === undefined ? null: msg.channel.guild.name, 
        msg.author.username, msg.content.slice(Prefix.length), msg.channel.name);
});