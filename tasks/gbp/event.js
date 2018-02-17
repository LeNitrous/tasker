const Bandori = require('../../mods/BandoriUtils.js');

module.exports = {
    name: "BanG Dream! Cards",
    desc: "Girls Band Party game event",
    help: 'Get current Girls Band Party event.',
    task: (Kokoro, msg, args) => {
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
                        return Kokoro.send(msg.channel, "❎", "There is no event found");
                Kokoro.error(msg, module.exports, error.message);
            });
    }
};