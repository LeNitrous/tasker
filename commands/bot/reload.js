module.exports = {
    name: 'Reload',
    desc: 'Refresh command cache',
    preq: ['BotOwnerOnly'],
    run: (Kokoro, msg, args) => {
        Kokoro.Handler.loadCommands('./commands')
            .then(cmd => {
                Kokoro.Bot.commands = cmd;
                Kokoro.Bot.send(msg.channel, '✅', 'Reloaded all commands.');
            })
            .catch(err => {
                msg.channel.send(Kokoro.Bot.config.reply.SysError);
                Kokoro.Bot.logger.error(err);
            });
    }
};