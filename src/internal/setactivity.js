module.exports = {
    name: "Set Avatar",
    desc: "Set the bot's activity",
    help: "Set the bot's activity.",
    preq: ["BotOwnerOnly"],
    args: [
        {name: "name", desc: "The activity name"},
        {name: "type", desc: "The activity type. Refer to: https://discord.js.org/#/docs/main/stable/typedef/ActivityType"},
        {name: "url", desc: "The stream URL", optional: true},
    ],
    task: (Bot, msg, args) => {
        if (args[0] === undefined)
            return msg.channel.send("Activity name can't be empty.");
        if (args[1] === undefined)
            return msg.channel.send("Activity type can't be empty.");
        if (args[2] === undefined && args[1].toUpperCase() == "STREAMING")
            return msg.channel.send("Activity stream link can't be empty.");
        else if (checkURL(args[2]))
            return msg.channel.send("Activity stream link is invalid.");

        Bot.user.setActivity(
            args[0],
            {
                type: args[1].toUpperCase(),
                url: args[2]
            }
        );
    }
};

// from https://stackoverflow.com/questions/17726427/check-if-url-is-valid-or-not
function checkURL(s) {    
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);    
}