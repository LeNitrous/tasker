module.exports = {
    name: "Freeze",
    desc: "Set the bot's frozen status",
    help: "Set the bot's frozen status. Useful for situations where it requires maintenance.",
    preq: ["BotOwnerOnly"],
    task: (Bot, msg, args) => {
        Bot.freeze();
    }
};