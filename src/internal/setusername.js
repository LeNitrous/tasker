module.exports = {
    name: "Set Username",
    desc: "Set the bot's username",
    help: "Set the bot's username.",
    preq: ["BotOwnerOnly"],
    args: [
        {name: "name", desc: "The new username"},
    ],
    task: (Bot, msg, args) => {
        if (args.length == 0)
            msg.channel.send("Username can't be empty.");
        else {
            var username = args.join(" ");
            Bot.user.setUsername(username);
            msg.channel.send("The new username has been set.");
        }
    }
};