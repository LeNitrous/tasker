module.exports = {
    help: 'Reload a command',
    args: ['command'],
    preq: ['BotOwnerOnly'],
    run: (bot, msg, args) => {
        if (args.length < 1) {
            console.log('here!');
            bot.ShouldRunCommands = false;
            bot.user.setStatus('dnd');
            bot.user.setGame(bot.Config.reply.StatusBusy);
            bot.LoadCommands(bot.CommandsDir)
                .then(d => {
                    bot.Commands = d;
                    bot.ShouldRunCommands = true;
                    bot.user.setStatus('online');
                    bot.user.setGame();
                });
        }
        else {
            bot.ReloadCommand(args, bot.CommandsDir)
                .then(com => {
                    if (com)
                        msg.channel.send(bot.Config.reply.Reload.replace('{0}', com.join(' ')));
                    else
                        msg.channel.send(bot.Config.reply.Error);
                })
                .catch(e => {
                    if (e.code == 'MODULE_NOT_FOUND')
                        msg.channel.send(bot.Config.reply.ReloadNotFound.replace('{0}', args.join(' ')));
                    console.log(e.error);
                });
        };
    }
}