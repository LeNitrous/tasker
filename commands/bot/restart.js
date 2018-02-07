module.exports = {
    name: 'Restart',
    desc: 'Restart the bot',
    preq: ['BotOwnerOnly'],
    run: (Kokoro, msg, args) => {
        Kokoro.Bot.restart();
    }
};