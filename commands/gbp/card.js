const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Search for BanG Dream! cards using keywords or its ID",
    help: 'Search for BanG Dream! cards using keywords.\nKeywords can be "rarity" (number), "attribute", "name" (first name). You can also use "ID" (number) to look it up directly',
    run: (Kokoro, msg, args) => {
        if (args.length <= 0) {
            return Kokoro.Bot.send(msg, "❎", "Incorrect search terms");
        }
        else if (args.length <= 1 && !isNaN(args[0])) {
            Bandori.Api.getCardByID(args[0])
                .then(card => {
                    Bandori.sendCard(msg, card);
                })
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.emit('error', {
                        msg: msg,
                        err: new Kokoro.Bot.Error(module.exports.name, error.message)
                    });
                });
        }
        else {
            Bandori.Api.getCardByQuery(args)
                .then(cards => {
                    Bandori.sendCard(msg, cards);
                })
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    Kokoro.emit('error', {
                        msg: msg,
                        err: new Kokoro.Bot.Error(module.exports.name, error.message)
                    });
                });
        }
    }
};