const Bot = require("./src/Bot.js");
const Kokoro = new Bot({
    tasks: "tasks/**",
    token: "MzMxNTUyMDA0NTQ1NTc2OTYx.DWjjNQ.ZzWcrXLK1OW1CB1m6_ZciiFpW5A",
    prefix: "~!",
    ownerID: ["170905486407761931"],
    logError: true
});

Kokoro.on("ready", () => {
    Kokoro.user.setActivity(
        `${Kokoro.prefix}help`,
        {type: "LISTENING"}
    )
});

Kokoro.loadJob(require("./jobs/BandoriBirthday.js"));
Kokoro.loadJob(require("./jobs/BandoriEvent.js"));
Kokoro.start();