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
    name: "BanG Dream! Art",
    desc: "Search for BanG Dream! card art using keywords or its ID",
    help: 'Search for BanG Dream! card art using keywords.\nKeywords can be "rarity" (number), "attribute", "name" (first name). You can also use "ID" (number) to look it up directly\nUse "trained" or "normal" to get what state. Leave blank to set it to normal.',
    run: (Kokoro, msg, args) => {
        args = args.map(val => val.toLowerCase());
        var allowStates = ['trained', 'normal'];
        var state = args.filter(str => allowStates.includes(str) );
        if (state.length > 0) {
            state = state.shift();
            args.remove(state);
        }
        else
            state = 'normal';
        if (args.length <= 0)
            return Kokoro.Bot.send(msg, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0])) {
            Bandori.Api.getCardByID(args[0])
                .then(card => {
                    Bandori.sendCardArt(msg, card, state);
                })
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        }
        else {
            Bandori.Api.getCardByQuery(args)
                .then(cards => {
                    Bandori.sendCardArt(msg, cards, state);
                })
                .catch(error => {
                    if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There were no matches found");
                    Kokoro.Bot.Error(msg, module.exports.name, error.message);
                });
        }
    }
};