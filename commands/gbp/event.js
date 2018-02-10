const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Get present Girls Band Party event",
    help: 'Get present Girls Band Party event',
    run: (Kokoro, msg, args) => {
        Bandori.Api.getCurrentEvent()
            .then(event => 
                Promise.all([
                    event.getCards(),
                    event.getMusic()
                ]).then(response => {
                    Bandori.sendEvent(msg, event, response[0], response[1])
                })
            )
            .catch(error => {
                if (error.name == 'EmptyResponseError')
                        return Kokoro.Bot.send(msg.channel, "❎", "There is no event found");
                Kokoro.Bot.Error(msg, module.exports.name, error.message);
            });
    }
};