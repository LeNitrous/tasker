// Example Command

module.exports = {
    help: 'Example Command',
    args: ['pong', 'pang'],
    preq: ['DMChatOnly', 'ServerOnly', 'BotOwnerOnly', 'HasElevatedPerms', 'ServerOwnerOnly'],
    perm: ["MANAGE_CHANNELS"],
    run: (bot, msg, args) => {
        msg.channel.send('Hello World!');
    }
}