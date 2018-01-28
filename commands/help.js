module.exports = {
    name: 'Help',
    desc: 'Sends yourself a list of useable commands',
    args: ['page', 'command'],
    run: (Kokoro, msg, args) => {
        Kokoro.Bot.help(Kokoro, msg, args);
    }
};