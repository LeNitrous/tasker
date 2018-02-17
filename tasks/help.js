/* LEGACY DO NOT DISTRUBUTE TO SERVER */
/*     UPDATED FOR NEW FRAMEWORK      */

const Discord = require('discord.js');

module.exports = {
    name: "Task Help",
    desc: 'Shows task help',
    help: 'Shows task help.',
    args: [
        {name: "task", desc: "Task to show help", optional: true}
    ],
    task: (Kokoro, msg, args) => {
        var helpText = Kokoro.handler.help(Kokoro, msg, args);
        if (helpText.length > 1950) {
            var block = Discord.Util.splitMessage(helpText);
            block.forEach(text => {
                msg.channel.send(text, {code: 'md'});
            });
        }
        else
            msg.channel.send(helpText, {code: 'md'});
    }
};

function clean(text) {
    if (typeof(text) === 'string')
      return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    else
        return text;
};