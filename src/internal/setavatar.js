module.exports = {
    name: "Set Avatar",
    desc: "Set the bot's avatar",
    help: "Set the bot's avatar.",
    preq: ["BotOwnerOnly"],
    args: [
        {name: "avatar", desc: "The avatar URL"}
    ],
    task: (Bot, msg, args) => {
        if (checkURL(args[0])) {
            Bot.user.setAvatar(args[0]);
            msg.channel.send("The new avatar has been set.");
        }
        else {
            msg.channel.send("You have used an invalid URL.");
        }
    }
};

// from https://stackoverflow.com/questions/17726427/check-if-url-is-valid-or-not
function checkURL(s) {    
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);    
}