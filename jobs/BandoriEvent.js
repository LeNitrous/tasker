var Bandori = require("../mods/BandoriUtils.js");
var fs = require("fs");

var settingsDir = "../data/guilds.json";
var garupaDir = "../data/Bandori.json";

module.exports = {
    name: "BandoriEvent",
    time: "00 00 15 * * *",
    timezone: "Asia/Tokyo",
    task: (Bot) => {
        Bandori.Api.getCurrentEvent()
            .then(event => 
                Promise.all([
                    event.getCards(),
                    event.getMusic(),
                    event.getLocale()
                ])
                .then(event => {
                    if (!fs.existsSync(settingsDir))
                        saveData(Bot, settingsDir, []);
                    settings = require(settingsDir);
                    if (fs.existsSync(garupaDir))
                        saveData(Bot, garupaDir, {});
                    garupa = require(garupaDir);
                    if (!garupa.event)
                        garupa.event = {};
                    if (garupa.event.id == event.id) return;
                    settings.forEach(item => {
                        if (!item.bandori.eventChannel) return;
                        var channel = Kokoro
                            .guilds.find("id", item.guild)
                            .channels.find("id", item.bandori.eventChannel);
                        channel.send("**New Event!**");
                        Bandori.sendEvent(channel, event, event[0], 
                            event[1], event[2]);
                    });
                    garupa.event = {
                        id: event.id,
                        name: event[2].name
                    };
                    saveData(Bot, garupaDir, garupa);
                })
            )
            .catch(error => new Error(error));
    }
}

function saveData(bot, dir, data) {
    fs.writeFile(dir, JSON.stringify(data),
        error => {
            if (error) return new Error(error);
        });
}