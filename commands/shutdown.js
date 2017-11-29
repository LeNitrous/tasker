module.exports = {
    name: 'Shutdown',
    help: 'Shutdown the bot gracefully.',
    preq: ['BotOwnerOnly'],
    run: (bot, msg, args) => {
        process.exit();
    }
};