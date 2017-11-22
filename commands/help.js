const Command = require('../models/Command.js');
const Group = require('../models/Group.js');

module.exports = {
    help: 'Display help menu',
    args: ['page', 'command', 'group'],
    run: (bot, msg, args) => {
        var helpMenu = [];
        if (args.length < 1) {
            helpMenu.push('# Command List:')
            for (var prop in bot.Commands) {
                if (bot.Commands.hasOwnProperty(prop)) {
                    var name = prop;
                    helpMenu.push(`\t- ${name}`);
                };
            };
        }
        else if (args.length == 1) {
            if (bot.Commands.hasOwnProperty(args[0])) {
                if (bot.Commands[args[0]] instanceof Group) {
                    helpMenu.push(`# ${args[0]} Command List:`)
                    for (var prop in bot.Commands[args[0]]) {
                        if (bot.Commands[args[0]].hasOwnProperty(prop)) {
                            var name = prop;
                            helpMenu.push(`\t- ${name}`);
                        };
                    };
                }
                else {
                    var com = bot.Commands[args[0]];
                    var name = args[0];
                    helpMenu.push(`# ${name}\n\t- Help: ${com.help}\n\t- Arguments: ${com.args.join(' ')}`);
                };
            };
        }
        else if (args.length == 2) {
            if (bot.Commands.hasOwnProperty(args[0])) {
                var com = bot.Commands[args[0]][args[1]];
                var name = args.join(' ');
                helpMenu.push(`# ${name}\n\t- Help: ${com.help}\n\t- Arguments: ${com.args.join(' ')}`);
            };
        };
        if (helpMenu.length == 0)
            msg.author.send('❌ » No command exists.');
        else
            msg.author.send(helpMenu.join('\n'), {code: 'md'});
    }
}