module.exports = {
    name: 'Shutdown',
    desc: 'Shutdown the bot gracefully',
    preq: ['BotOwnerOnly'],
    run: (Kokoro, msg, args) => {
        Kokoro.Bot.shutdown();
    }
};