const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Search for BanG Dream! cards using keywords",
    help: 'Search for BanG Dream! cards using keywords. Keywords can be "rarity" (number), "attribute", "name" (first name)',
    run: (Kokoro, msg, args) => {
        Bandori.Api.getCard(args)
            .then(cards => {
                Bandori.sendCard(msg, cards);
            })
            .catch(error => {
                throw new Kokoro.Bot.Error(module.exports.name, error);
            });
    }
};