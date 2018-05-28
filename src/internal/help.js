module.exports = {
    name: "Help",
    desc: "Bot task listing",
    help: "Send yourself a list of useable tasks within the bot.",
    args: [
        {name: "command", desc: "Command name"}
    ],
    task: (Bot, msg, args) => {
        var help = Bot.Handler.help(Bot, msg, args);
        msg.author.send(help, {code: "md"});
    }
};