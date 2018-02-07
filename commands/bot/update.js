module.exports = {
    name: 'Update',
    desc: 'Update bot files from repository',
    preq: ['BotOwnerOnly'],
    run: (Kokoro, msg, args) => {
        Kokoro.Bot.update();
    }
};