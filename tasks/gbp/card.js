const Bandori = require('../../mods/BandoriUtils.js');

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
    desc: "Girls Band Party card search",
    help: 'Search for BanG Dream! cards using keywords.',
    args: [
        {name: "id", desc: "Search with a numeric ID instead", optional: true},
        {name: "search", desc: "Add \"search\" to do a full search instead", optional: true},
        {name: "name", desc: "Character's first name keyword"},
        {name: "rarity", desc: "Card's rarity number keyword"},
        {name: "attribute", desc: "Card's attribute keyword"},
    ],
    task: (Kokoro, msg, args) => {
        var isSearch = args.includes('search');
        if (isSearch)
            args.remove('search');
        if (args.length <= 0) 
            return Kokoro.send(msg.channel, "❎", "Search cannot be empty");
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
                        return Kokoro.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.error(msg, module.exports, error);
                });
        }
        else if (isSearch) {
            Bandori.Api.getCardByQuery(args)
                .then(cards =>
                    Bandori.sendSearch(msg.author, cards)
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
            Bandori.Api.getCardByQuery(args)
                .then(card => 
                    card[0].getLocale()
                        .then(locale => {
                            Bandori.sendCard(msg.channel, card, locale);
                        })
                )
                .catch(error => {
                    if (error.stats == 400)
                        return Kokoro.send(msg.channel, "❎", "There were no matches found");
                    if (error.name == 'InvalidParameterError')
                        return Kokoro.send(msg.channel, "❎", "Incorrect query syntax");
                    Kokoro.error(msg, module.exports.name, error.message);
                });
        };
    }
};