const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Music",
    help: "Search for BanG Dream! music using keywords or its ID",
    full: "Search for BanG Dream! music using keywords or its ID",
    run: (bot, msg, args) => {
        Bandori.Api.getMusicByID(args[0])
                .then(music=> {
                    Bandori.sendMusic(msg, music);
                })
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no music with that ID");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
    }
};