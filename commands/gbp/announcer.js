const fs = require('fs');

module.exports = {
    name: "BanG Dream! Announcer",
    preq: ["HasElevatedPerms", "ServerOnly"],
    perm: ["MANAGE_CHANNELS"],
    desc: "Allow and enable the announcer.",
    help: 'Allow and enable the announcer. ' +
    'Mention a channel to set one or leave empty to disable announcer. ' +
    'Make sure that the bot has "SEND_MESSAGES" permission in that channel. ' +
    'Available announcer settings are "birthday" and "event"',
    run: (Kokoro, msg, args) => {
        var setting = require('../../data/guild.json');
        var guildpos = setting.findIndex(elem => elem.guild == msg.guild.id);
        if (args.length <= 0)
            return Kokoro.Bot.send(msg.channel, "❎", `Please use a valid setting. See help for details.`);
        var selected = args.shift().toLowerCase();
        if (guildpos == -1) {
            setting.push({
                guild: msg.guild.id
            });
            guildpos = setting.findIndex(elem => elem.guild == msg.guild.id);
        }
        if (!setting[guildpos].bandori)
            setting[guildpos].bandori = {};
        if (selected == "birthday") {
            if (args.length == 0 && setting[guildpos].bandori.birthdayAnnounceChannel) {
                delete setting[guildpos].bandori.birthdayAnnounceChannel;
                fs.writeFile('./data/guild.json', JSON.stringify(setting), (err) => {
                    if (err) throw Kokoro.Bot.Error(msg, module.exports.name, err);
                });
                return Kokoro.Bot.send(msg.channel, "✅", `Disabled birthday announcer.`);
            }
            else if (args.length == 0)  {
                return Kokoro.Bot.send(msg.channel, "❎", "Mention a channel to set the birthday announcer.");
            }
            var chanId = args.filter(word => word.search(/<#[0-9]+>/) > -1).shift();
            if (!chanId)
                return Kokoro.Bot.send(msg.channel, "❎", "Invalid channel.");
            chanId = chanId.substring(2, chanId.length - 1);
            channel = msg.guild.channels.find('id', chanId);
            if (channel.type == 'voice')
                return Kokoro.Bot.send(msg.channel, "❎", "Cannot use a voice channel.");
            if (guildpos == -1) {
                setting.push({
                    guild: msg.guild.id,
                });
                guildpos = setting.findIndex(elem => elem.guild == msg.guild.id);
            }
            setting[guildpos].bandori.birthdayAnnounceChannel = chanId;
            fs.writeFile('./data/guild.json', JSON.stringify(setting), (err) => {
                if (err) throw Kokoro.Bot.Error(msg, module.exports.name, err);
            });
            Kokoro.Bot.send(msg.channel, "✅", `Birthday announce channel is set to <#${chanId}>.`);
        }
        else if (selected == "event") {
            if (args.length == 0 && setting[guildpos].bandori.eventAnnounceChannel) {
                delete setting[guildpos].bandori.eventAnnounceChannel;
                fs.writeFile('./data/guild.json', JSON.stringify(setting), (err) => {
                    if (err) throw Kokoro.Bot.Error(msg, module.exports.name, err);
                });
                return Kokoro.Bot.send(msg.channel, "✅", `Disabled event announcer.`);
            }
            else if (args.length == 0)  {
                return Kokoro.Bot.send(msg.channel, "❎", "Mention a channel to set the event announcer.");
            }
            var chanId = args.filter(word => word.search(/<#[0-9]+>/) > -1).shift();
            if (!chanId)
                return Kokoro.Bot.send(msg.channel, "❎", "Invalid channel.");
            chanId = chanId.substring(2, chanId.length - 1);
            channel = msg.guild.channels.find('id', chanId);
            if (channel.type == 'voice')
                return Kokoro.Bot.send(msg.channel, "❎", "Cannot use a voice channel.");
            if (guildpos == -1) {
                setting.push({
                    guild: msg.guild.id,
                });
                guildpos = setting.findIndex(elem => elem.guild == msg.guild.id);
            }
            setting[guildpos].bandori.eventAnnounceChannel = chanId;
            fs.writeFile('./data/guild.json', JSON.stringify(setting), (err) => {
                if (err) throw Kokoro.Bot.Error(msg, module.exports.name, err);
            });
            Kokoro.Bot.send(msg.channel, "✅", `Event announce channel is set to <#${chanId}>.`);
        }
    }
};