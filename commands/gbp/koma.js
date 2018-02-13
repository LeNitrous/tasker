const Bandori = require('../../modules/BandoriHandler');

module.exports = {
    name: "BanG Dream! Komas",
    desc: "Get a random one-frame cartoon",
    help: 'Get a random one-frame cartoon.',
    run: (Kokoro, msg, args) => {
        Bandori.Api.getKomas()
            .then(koma => 
                Bandori.sendKoma(msg.channel, koma[getRandomInt(koma.length)])
            )
            .catch(error => {
                Kokoro.Bot.Error(msg.channel, module.exports.name, error.message);
            });
    }
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}