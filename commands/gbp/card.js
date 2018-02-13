const Bandori = require('../../modules/BandoriHandler');

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Search for BanG Dream! cards using keywords or its ID",
    help: 'Search for BanG Dream! cards using keywords. ' +
    'Keywords can be "rarity" (number), "attribute", "name" (first name). You can also use "ID" (number) to look it up directly. ' +
    'Add the "search" keyword to perform a card search instead to list all occurences.',
    run: (Kokoro, msg, args) => {
        var isSearch = args.includes('search');
        if (isSearch)
            args.remove('search');
        if (args.length <= 0) 
            return Kokoro.Bot.send(msg.channel, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0]) && !isSearch) {
            Bandori.Api.getCardByID(args[0])
                .then(card =>
                    card.getLocale()
                        .then(locale => {
                            Bandori.sendCard(msg.channel, card, locale);
                        })
                )
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.Bot.Error(msg, module.exports.name, error);
                });
        }
        else if (isSearch) {
            Bandori.Api.getCardByQuery(args)
                .then(cards =>
                    Bandori.sendSearch(msg.author, cards)
                )
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.Bot.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        }
        else {
            Bandori.Api.getCardByQuery(args)
                .then(card => 
                    card[0].getLocale()
                        .then(locale => {
                            Bandori.sendCard(msg.channel, card, locale);
                        })
                )
                .catch(error => {
                    if (error.stats == 400)
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.Bot.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        };
    }
};