const fs = require('fs');
const path = require('path');

const dataDir = path.resolve("data/guilds.json");

module.exports = {
    name: "BanG Dream! Announcer",
    desc: "Girls Band Party news announcer",
    help: "Toggle announcer settings. Make sure the bot has " +
    "has \"SEND_MESSAGES\" permission in the selected channel.",
    args: [
        {name: "channel", desc: "Mentioned channel"}
    ],
    task: (Kokoro, msg, args) => {
        var allowedOptions = ["birthday", "event"];
        console.log(fs.existsSync(dataDir));
        if (!fs.existsSync(dataDir)) {
            saveData(Kokoro, msg, dataDir, []);
        }
        var setting = require(dataDir);
        if (args.length < 1)
            return Kokoro.send(msg.channel, "❎", "Option is empty.");
        var selected = args.shift().toLowerCase();
        if (!allowedOptions.includes(selected))
            return Kokoro.send(msg.channel, "❎", "Invalid option. See help for details.");
        var guildPos = setting.findIndex(item => item.guild == msg.guild.id);
        if (guildPos == -1) {
            setting.push({
                guild: msg.guild.id
            });
            guildPos = setting.findIndex(item => item.guild == msg.guild.id);
        }
        if (!setting[guildPos].bandori)
            setting[guildPos].bandori = {};
        editData(Kokoro, msg, args, setting, guildPos, dataDir, selected);
    }
}

function editData(bot, msg, args, setting, pos, dir, name) {
    if (args.length == 0 && setting[pos].bandori.birthdayChannel) {
        setting[pos].bandori.birthdayChannel = undefined;
        saveData(bot, msg, dir, setting);
        return bot.send(msg.channel, "✅", `Disabled "${name}" announcer.`);
    }
    else if (args.length == 0) {
        return bot.send(msg.channel, "❎", `Mention a channel to set "${name}" announcer.`);
    }
    else {
        var chanId = args.filter(word => word.search(/<#[0-9]+>/) > -1).shift();
        if (!chanId)
            return bot.send(msg.channel, "❎", "Invalid channel.");
        chanId = chanId.substring(2, chanId.length - 1);
        var channel = msg.guild.channels.find('id', chanId);
        if (channel.type == 'voice')
            return bot.send(msg.channel, "❎", "Cannot use a voice channel.");
        setting[pos].bandori.birthdayChannel = chanId;
        saveData(bot, msg, dir, setting);
        bot.send(msg.channel, "✅", `"${name}" setting is set to <#${chanId}>.`);
    }
}

function saveData(bot, msg, dir, data) {
    fs.writeFile(dir, JSON.stringify(data),
        error => {
            if (error) return new bot.error(msg, module.exports, error);
        });
}