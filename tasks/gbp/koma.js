const Bandori = require('../../mods/BandoriUtils.js');

module.exports = {
    name: "BanG Dream! Komas",
    desc: "Girls Band Party loading komas",
    help: 'Get a random one-frame cartoon.',
    task: (Kokoro, msg, args) => {
        Bandori.Api.getKomas()
            .then(koma => 
                Bandori.sendKoma(msg.channel, koma[getRandomInt(koma.length)])
            )
            .catch(error => {
                Kokoro.throwError(msg, error);
            });
    }
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}