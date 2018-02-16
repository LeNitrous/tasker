# Kokoro-Base
The base bot framework used to run the BanG Dream! data-viewer bot. Built with Node.js and Discord.js. To see the bot in-action, feel free to visit my [Discord Server](https://discord.gg/77Wpjvm)

## Requirements
- [Node.js 6.0.0](https://nodejs.org/en/) or newer
- [Discord.js 11.3](https://discord.js.org/#/)

## Features
- Command handling with grouped command support.
- Logging system.
- Modular event plugin and cron-based job support.
- Promise-based request handling.

## Installation
- Clone this repository in a clean working directory
- Install all dependecies using `npm install`
- Example:

```js
const Bot = require("./src/Bot.js")
const Kokoro = new Bot({
    token: "your-token-here",
    prefix: "!",
    ownerID: ["your-id"],
    tasks: "your/command/directory"
});

Kokoro.start();
```

## License
This project is licensed under the MIT License. Please read the [license](https://github.com/LeNitrous/kokoro-base/blob/master/LICENSE) in this repository. [tl;dr](https://tldrlegal.com/license/mit-license) version of the license.