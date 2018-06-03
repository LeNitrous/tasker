# Tasker
The base bot framework built with Node.js and Discord.js. To see the bot in-action, feel free to visit my [Discord Server](https://discord.gg/77Wpjvm)

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

#### Example:
```js
const Tasker = require("./src/Bot.js")
const Bot = new Bot({
    token: "your-token-here",
    prefix: "!",
    ownerID: ["your-id"],
    tasks: "your/command/directory"
});

Bot.start();
```

## Tasks System

### Tasks
Commands are referred to as "tasks". To create a new task, place a javascript file with it's file name being the task's alias in your tasks directory. It is a module that will be read when the bot is launched.
```js
// mytask.js
module.exports = {
    name: "My Task",                            // Your task's name displayed on the help listings.
    desc: "This is my task",                    // Your task's description displayed on the help listings.
    help: "This task says Hello World!",        // Your task's help text displayed on the help menu.
    preq: ["ServerOnly", "HasElevatedPerms"],   // The bot's prerequisite flags when checking permissions.
    perm: ["MANAGE_MESSAGES"],                  // Discord's permission flags when checking permissions.
    task: (Bot, msg, args) => {                 // The task performed when the caller has permission.
        msg.channel.send("Hello World!");
    }
}
```
Using the example above, you can use `!mytask` in Discord to run the task.

### Task Groups
Subcommands are referred to as "task groups". To create a task group, create a new folder with the group's alias as it's name inside your tasks directory and place a `settings.json` for its metadata. You can then add tasks inside it.
```js
// mygroup/settings.json
module.exports = {
    "name": "My Task Group",                    // Your task group's name displayed on the help listings.
    "desc": "This is my task group"             // Your task group's description displayed on the help listings.
}
// mygroup/mytask.js
// ...refer to the example above
```
Using the example above, you can use `!mygroup mytask` to run the task from within a task group.

## Permission System
The bot has a permission system in order to check if the user or the bot has rights in running a command.

### Prerequisite Flags
- `DMChatOnly` - The task can only be ran in a direct message.
- `ServerOnly` - The task can only be ran inside a guild server channel.
- `BotOwnerOnly` - The task can only be ran by the bot and the owner/s.
- `HasElevatedPerms` - The task can only be ran inside a guild and the caller has permissions.
- `ServerOwnerOnly` - The task can only be ran inside a guild and the caller is the guild's owner.

### Permission Flags
Please refer to [discord.js](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS) documentation for the list of useable flags and its description.

## Event Tasks
The bot can attach as many event listeners as it can. Please refer to [discord.js](https://discord.js.org/#/docs/main/stable/class/Client) documentation for the list of events emitted.

To attach your own, create a new javascript file and require it in your main javascript file.
```js
// event.js
module.exports = {
    name: "My Event",               // Your unique event name
    event: "message",               // The listened event
    task: (msg) => {                // The task ran when the event is emitted with the arguments being what is passed onto it.
        msg.channel.send("Hello!");
    }
}
// bot.js
// ..refer to the example above first.
var myEvent = require("event.js");
Bot.loadEvent(myEvent);
```

## Job Tasks
The bot can do cronjobs. Cronjobs are only ran on a the specified time of day.

To create your own, create a new javascript file and require it in your main javascript file.
```js
// job.js
module.exports = {
    name: "My Job",                 // Your unique job name
    time: "00 00 * * * *",          // The cron pattern. This example is ran every hour.
    timezone: "Asia/Tokyo",         // The timezone
    task: (Bot) => {                // The task ran when the event is emitted with the arguments being the bot itself.
        Bot.shutdown();
    }
}
// bot.js
// ..refer to the example above first.
var myJob = require("job.js");
Bot.loadJob(myJob);
```

- Please refer to [crontab.js](https://github.com/kelektiv/node-cron#available-cron-patterns) for the available cron patterns.
- Please refer to [momentjs](https://momentjs.com/timezone/) for the available timezones.

## Tasker Properties
Tasker has properties to be set alongside discord.js to make use of it's utilities.
- `tasks` - The tasks directory in glob pattern. Please refer to [glob](https://github.com/isaacs/node-glob) documentation.
- `token` - The application's token provided by Discord.
- `prefix` - The prefix when running tasks.
- `ownerID` - An array of strings of all IDs of the owners.
- `timeout` - A number in seconds as cooldown in between requests.
- `debug` - A boolean to enable discord.js' debug events.
- `logFile` - The directory where to log and save the bot's logs.

## Tasker Methods
Tasker also provides utility methods.

#### .start()
**Use this when starting your bot.** Loads all tasks and logs the bot in.
Returns the bot itself.

#### .reloadTasks()
Reloads the tasks directory. Useful when appending new tasks without the need of restarting the bot itself.

#### .loadEvent(event)
- `event` - The event's unique name

Loads an event. See the example above.

#### .destroyEvent(event)
- `event` - The event's unique name

Destroy's the event and stops listening for it.

#### .loadJob(job)
- `job` - The job's unique name

Loads a job. See the example above.

#### .doJob(job)
- `job` - The job's unique name

Force runs a job. 
}

#### .destroyJob(job)
- `job` - The job's unique name

Destroys and stops the job.

#### .invoke(channel, content, user)
- `channel` - The guild channel.
- `content` - The content as if sent by a user without the prefix.
- `user` - The user invoking the command as. Defaults to the bot itself when not provided.

This simulates a task being ran with permissions still being applied to it. Triggers an error when the user can't invoke it.

#### .shutdown()
Gracefully shuts down the bot.

## License
This project is licensed under the MIT License. Please read the [license](https://github.com/LeNitrous/tasker/blob/master/LICENSE) in this repository. [tl;dr](https://tldrlegal.com/license/mit-license) version of the license.