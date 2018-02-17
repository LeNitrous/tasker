const Bandori = require('../../mods/BandoriUtils.js');

module.exports = {
    name: "BanG Dream! Music",
    desc: "Girls Band Party music search",
    help: 'Search for BanG Dream! music using keywords or by ID.' +
    'Keywords can be by "band" (popipa/afuro/pasupare/roselia/harohapi/other) or "type" (cover/original) ' +
    'Add the "search" keyword to perform a music search instead to list all occurences. ',
    args: [
        {name: "id", desc: "Search with a numeric ID instead", optional: true},
        {name: "search", desc: "Add \"search\" to do a full search instead", optional: true},
        {name: "band", desc: "Band's nickname: popipa | afuro | pasupare | roselia | harohapi"},
        {name: "type", desc: "Music type: cover | original"}
    ],
    task: (Kokoro, msg, args) => {
        var isSearch = args.includes('search');
        if (isSearch)
            args.remove('search');
        if (args.length <= 0) 
            return Kokoro.Bot.send(msg.channel, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0]) && !isSearch) {
            Bandori.Api.getMusicByID(args[0])
                .then(music =>
                    Bandori.sendMusic(msg.channel, music)
                )
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.send(msg.channel, "❎", "There is no music with that ID");
                    Kokoro.error(msg, module.exports, error.message);
                });
        }
        else if (isSearch) {
            Bandori.Api.getMusicByQuery(args)
                .then(music =>
                    Bandori.sendSearch(msg.author, music)
                )
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.error(msg, module.exports, error.message);
                });
        }
        else {
            Bandori.Api.getMusicByQuery(args)
                .then(music =>
                    Bandori.sendMusic(msg.channel, music)
                )
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.error(msg, module.exports, error.message);
                });
        };
    }
};