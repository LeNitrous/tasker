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
    name: "BanG Dream! Art",
    desc: "Girls Band Party card art",
    help: "Search for BanG Dream! card art using keywords or by ID.",
    args: [
        {name: "id", desc: "Search with a numeric ID instead", optional: true},
        {name: "name", desc: "Character's first name keyword"},
        {name: "rarity", desc: "Card's rarity number keyword"},
        {name: "attribute", desc: "Card's attribute keyword"},
    ],
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
            return Kokoro.send(msg, "❎", "Search cannot be empty");
        else if (args.length <= 1 && !isNaN(args[0])) {
            Bandori.Api.getCardByID(args[0])
                .then(card => {
                    Bandori.sendCardArt(msg.channel, card, state);
                })
                .catch(error => {
                    if (error.staus == 400)
                        return Kokoro.send(msg.channel, "❎", "There is no card with that ID");
                    Kokoro.error(msg, module.exports, error.message);
                });
        }
        else {
            Bandori.Api.getCardByQuery(args)
                .then(cards => {
                    Bandori.sendCardArt(msg.channel, cards, state);
                })
                .catch(error => {
                    if (error.status == 400)
                        return Kokoro.send(msg.channel, "❎", "There were no matches found");
                    Kokoro.error(msg, module.exports, error.message);
                });
        }
    }
};