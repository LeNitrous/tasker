const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Music",
    help: "Search for BanG Dream! music using keywords or by ID",
    full: 'Search for BanG Dream! music using keywords or by ID ' +
    'Keywords can be by "band" (popipa/afuro/pasupare/roselia/harohapi/other) or "type" (cover/original) ' +
    'Add the "search" keyword to perform a music search instead to list all occurences. ',
    run: (Kokoro, msg, args) => {
        var isSearch = args.includes('search');
        if (isSearch)
            args.remove('search');
        if (args.length <= 0) 
            return Kokoro.Bot.send(msg.channel, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0]) && !isSearch) {
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
        else if (isSearch) {
            Bandori.Api.getMusicByQuery(args)
                .then(music =>
                    Bandori.sendSearch(msg, music)
                )
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.Bot.send(msg.channel, "❎", "Incorrect query syntax");
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