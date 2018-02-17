/* LEGACY DO NOT DISTRUBUTE TO SERVER */
/*     UPDATED FOR NEW FRAMEWORK      */

const Discord = require('discord.js');

module.exports = {
    name: "Code Evaluation",
    desc: 'Evaluate Javascript code',
    help: 'Evaluate Javascript code. Note this should only be in local repo.',
    preq: ["BotOwnerOnly"],
    args: [
        {name: "code", desc: "Javascript Code"}
    ],
    task: (Kokoro, msg, args) => {
        try {
            const input = args.join(' ');
            let code = eval(input);

            if (typeof code !== 'string')
                code = require('util').inspect(code);
            
            if (clean(code).length > 1950) {
                var result = Discord.Util.splitMessage(clean(code));
                result.forEach(block => {
                    msg.channel.send(block, {code: 'xl'});
                });
            }
            else
                msg.channel.send(clean(code), {code: 'xl'});
        } catch (err) {
            msg.channel.send(clean(err), {code: 'xl'});
        };
    }
};

function clean(text) {
    if (typeof(text) === 'string')
      return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    else
        return text;
};