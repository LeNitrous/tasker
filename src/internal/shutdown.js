module.exports = {
    name: "Shutdown",
    desc: "Gracefully close the bot",
    help: "Gracefully close the bot.",
    preq: ["BotOwnerOnly"],
    task: (Bot, msg, args) => {
        Bot.shutdown();
    }
};