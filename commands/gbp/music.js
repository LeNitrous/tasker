const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Music",
    help: "Search for BanG Dream! music using keywords or its ID",
    full: "Search for BanG Dream! music using keywords or its ID",
    run: (Kokoro, msg, args) => {
        if (args.length <= 0) 
            return Kokoro.Bot.send(msg, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0])) {
            Bandori.Api.getMusicByID(args[0])
                .then(music =>
                    Bandori.sendMusic(msg, music)
                )
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no music with that ID");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        }
        else {
            Bandori.Api.getMusicByQuery(args)
                .then(music =>
                    Bandori.sendMusic(msg, music)
                )
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.Bot.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        };
    }
};