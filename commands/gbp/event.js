const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Get current Girls Band Party event",
    help: 'Get current Girls Band Party event.',
    run: (Kokoro, msg, args) => {
        Bandori.Api.getCurrentEvent()
            .then(event => 
                Promise.all([
                    event.getCards(),
                    event.getMusic(),
                    event.getLocale()
                ]).then(response => {
                    Bandori.sendEvent(msg.channel, event, response[0], response[1], response[2]);
                })
            )
            .catch(error => {
                if (error.status == 400)
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no event found");
                Kokoro.Bot.Error(msg, module.exports.name, error.message);
            });
    }
};