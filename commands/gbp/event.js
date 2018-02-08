const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Get present Girls Band Party event",
    help: 'Get present Girls Band Party event',
    run: (Kokoro, msg, args) => {
        Bandori.Api.getCurrentEvent()
            .then(event => {
                Bandori.sendEvent(msg, event);
            })
            .catch(error => {
                throw new Kokoro.Bot.Error(module.exports.name, error);
            });
    }
};