const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Search for BanG Dream! cards using keywords or its ID",
    help: 'Search for BanG Dream! cards using keywords.\nKeywords can be "rarity" (number), "attribute", "name" (first name). You can also use "ID" (number) to look it up directly',
    run: (Kokoro, msg, args) => {
        if (args.length <= 0) 
            return Kokoro.Bot.send(msg, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0])) {
            Bandori.Api.getCardByID(args[0])
                .then(card =>
                    card.getLocale()
                        .then(locale => {
                            Bandori.sendCard(msg, card, locale)
                        })
                )
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        }
        else {
            Bandori.Api.getCardByQuery(args)
                .then(card => 
                    card[0].getLocale()
                        .then(locale => {
                            Bandori.sendCard(msg, card, locale)
                        })
                )
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        };
    }
};