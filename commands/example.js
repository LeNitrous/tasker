// Example Command

module.exports = {
    help: 'Example Command',
    args: [''],
    preq: [''],
    perm: [''],
    run: (bot, msg, args) => {
        msg.channel.send('Hello World!');
    }
}