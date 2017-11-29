module.exports = {
    name: 'Reload',
    help: 'Reload a module',
    args: ['module'],
    preq: ['BotOwnerOnly'],
    run: (bot, msg, args) => {
        if (args.length < 1) {
            bot.ShouldRunCommands = false;
            bot.user.setStatus('dnd');
            bot.user.setGame(bot.Config.reply.StatusBusy);
            bot.LoadCommands(bot.CommandsDir)
                .then(d => {
                    bot.Commands = d;
                    bot.ShouldRunCommands = true;
                    bot.user.setStatus('online');
                    bot.user.setGame();
                    console.log('Reloaded all commands');
                    msg.author.send(bot.Config.reply.Reload.replace('{0}', 'all'));
                });
        }
        else {
            bot.ReloadCommand(args, bot.CommandsDir, bot.Commands)
                .then(com => {
                    if (com) {
                        msg.channel.send(bot.Config.reply.Reload.replace('{0}', com.join(' ')));
                        console.log(`Module ${com} has been reloaded`);
                    }
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