module.exports = {
    name: "Set Status",
    desc: "Set the bot's status",
    help: "Set the bot's status.",
    preq: ["BotOwnerOnly"],
    args: [
        {name: "status", desc: "The status. Refer to: https://discord.js.org/#/docs/main/stable/typedef/PresenceStatus"}
    ],
    task: (Bot, msg, args) => {
        var allowedStates = ["online", "idle", "dnd", "invisible"];
        if (!allowedStates.includes(args[0].toLowerCase()))
            msg.channel.send("Bot status is invalid.")
        else
            Bot.user.setStatus(args[0].toLowerCase());
    }
};