// Example Command

module.exports = {
    name: 'Example',
    help: 'Example Command',
    args: [''],
    preq: [''],
    perm: [''],
    run: (bot, msg, args) => {
        msg.channel.send('Hello World!');
    }
}