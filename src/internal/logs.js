module.exports = {
    name: "View Logs",
    desc: "View bot's logs",
    help: "View bot's logs of this runtime.",
    preq: ["BotOwnerOnly"],
    task: (Bot, msg, args) => {
        if (Bot.logFile) {
            msg.author.send("Here are the logs of this runtime.",
            {files: [{
                attachment: `./runtime.log`,
                name: `runtime.log`
            }]});
        }
        else {
            msg.author.send("You have file logging disabled.");
        }
    }
};