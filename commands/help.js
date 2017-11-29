module.exports = {
    name: 'Help',
    help: 'Sends yourself a list of useable commands.',
    args: ['page', 'command'],
    run: (bot, msg, args) => {
        const Commands = bot.Commands;
        const Command = bot.CommandType.Command;
        const Group = bot.CommandType.Group;
        const Config = bot.Config;

        var helpMenu = [];

        if (args.length < 1) {
            helpMenu.push('# Commands:')
            for (var prop in Commands) {
                if (Commands.hasOwnProperty(prop)) {
                    if (bot.CheckPermissions(msg, Commands[prop], Config))
                        helpMenu.push(`\t- ${prop}`);
                };
            };
        }
        else if (args.length == 1) {
            if (Commands[args[0]] instanceof Command) {
                if (!bot.CheckPermissions(msg, Commands[args[0]], Config))
                    return;
                var com = Commands[args[0]];
                var name = args[0];
                helpMenu.push(`# ${com.name}\n\t- Help: ${com.help}\n\t- Usage: ${Config.prefix}${name}`);
            }
            else if (Commands[args[0]] instanceof Group) {
                for (var prop in Commands[args[0]]) {
                    if (Commands[args[0]].hasOwnProperty(prop)) {
                        if (bot.CheckPermissions(msg, Commands[prop], Config))
                            helpMenu.push(`\t- ${prop}`);
                    };
                };
            };
        }
        else if (args.length == 2) {
            if (Commands.hasOwnProperty(args[0])) {
                if (!bot.CheckPermissions(msg, Commands[args[0]][args[1]], Config))
                    return;
                var com = Commands[args[0]][args[1]];
                var name = args.join(' ');
                helpMenu.push(`# ${com.name}\n\t- Help: ${com.help}\n\t- Usage: ${Config.prefix}${name}`);
            };
        };
        if (helpMenu.length == 0)
            return;
        else
            msg.author.send(helpMenu.join('\n'), {code: 'md'});
    }
};