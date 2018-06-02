const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Task = require('./models/Task.js');
const TaskGroup = require('./models/TaskGroup.js');

/**
 * The task manager class
 * @class TaskHandler
 * @param {Client} bot The Discord Client object
 */
class TaskHandler {
    constructor(bot) {
        this.bot = bot;
    }

    /**
     * Load bot tasks.
     * @param {String} dir Task module directory.
     * @returns {Promise.<Object>} The task object.
     */
    loadTasks(dir) {
        return new Promise((resolve, reject) => {
            glob(dir, (err, items) => {
                var root = new TaskGroup({
                    name: "Tasks",
                    desc: "Root task directory"
                });
                if (err)
                    reject(err);
                else {
                    dir = dir.replace(/\*/g, '');
                    items.shift();
                    items = items.map(str => str.substring(dir.length, str.length));
                    var expr = /\.[a-zA-Z]*/;
                    var file = items.filter(str => str.search(expr) > -1);
                    var folder = items.filter(str => str.search(expr) < 0);
                    folder.forEach(str => {
                        root.tasks[str] = new TaskGroup(require(path.resolve(".", dir, str,"settings.json")))
                        root.tasks[str].tasks.help = new Task({
                            name: `${root.tasks[str].name} Help`,
                            desc: "Bot task listing",
                            help: "Send yourself a list of useable tasks within the bot.",
                            task: (Bot, msg, args) => {
                                args.push(str);
                                var help = Bot.handler.help(Bot, msg, args);
                                msg.author.send(help, {code: "md"});
                            }
                        });
                    });
                    file.forEach(str => {
                        if (str.search(/[a-zA-Z]*\//) > -1) {
                            if (!str.endsWith(".js")) return;
                            var parentName = str.substring(0, str.indexOf("/"));
                            var childName = str.substring(str.indexOf("/") + 1, str.indexOf("."));
                            root.tasks[parentName].tasks[childName] = new Task(require(path.resolve(".", dir, str)));
                        }
                        else {
                            var name = str.substring(0, str.indexOf("."))
                            root.tasks[name] = new Task(require(path.resolve(".", dir, str)));
                        }
                    });
                    fs.readdir(__dirname + "/internal/", (err, files) => {
                        files.forEach(file => {
                            var name = file.split(".")[0];
                            root.tasks[name] = new Task(require("./internal/" + file));
                        });
                    });
                }
                resolve(root);
            });
        });
    }

    /**
     * Return called task.
     * @param {String[]} args The task arguments.
     * @param {TaskGroup} task The bot's root task group.
     * @returns {Promise.<Object>} The returned task and arguments.
     */
    getTask(args, task) {
        return new Promise((resolve, reject) => {
            var parentArg = args.shift();
            var loadedTask;
            if (!task.tasks[parentArg]) return;
            if (task.tasks[parentArg] instanceof TaskGroup) {
                var childArg = args.shift();
                if (!task.tasks[parentArg].tasks[childArg]) return;
                loadedTask = task.tasks[parentArg].tasks[childArg];
            }
            else if (task.tasks[parentArg] instanceof Task) {
                loadedTask = task.tasks[parentArg];
            }
            resolve({
                load: loadedTask,
                args: args
            });
        });
    }

    /**
     * Tests the activator's task permission.
     * @param {Message} msg The Discord message object.
     * @param {Client} bot The bot object.
     * @param {Task} task The executed task.
     * @returns {String} The permission reason when failed. Returns null when passed otherwise.
     */
    checkPermission(msg, bot, task) {
        if (task.preq.includes("DMChatOnly") && msg.channel.guild != undefined)
            return "DMChatOnly";
        if (task.preq.includes("ServerOnly") && msg.channel.guild == undefined)
            return "ServerOnly";
        if (task.preq.includes("BotOwnerOnly") && !bot.ownerID.includes(msg.author.id))
            return "BotOwnerOnly";
        if (task.preq.includes("HasElevatedPerms") && task.preq.includes("ServerOnly"))
            if (!msg.member.permissions.has(perm, true))
                return "HasElevatedPerms";
        if (task.preq.includes("ServerOwnerOnly") && task.preq.includes("ServerOnly"))
            if (msg.author.id != msg.guild.ownerID)
                return "ServerOwnerOnly";
        return null;
    }

    /**
     * Display help text of a task or task group.
     * @param {Client} bot The Discord client object.
     * @param {Message} msg The Discord message object.
     * @param {String} arg Task to display help text.
     * @returns {String} The formatted help text.
     */
    help(bot, msg, args) {
        var helpText = [];
        const root = bot.tasks;
        const parentArg = args[0];
        const childArg = args[1];
        const footer = `\n- Type "${bot.prefix}help <command>" for more details.`;

        switch(args.length) {
            case 0: {
                helpText.push(stringifyGroupHelp(root));
                break;
            }
            case 1: {
                if (root.tasks[parentArg] instanceof TaskGroup)
                    helpText.push(stringifyGroupHelp(root.tasks[parentArg], args));
                else if (root.tasks[parentArg] instanceof Task)
                    helpText.push(stringifyTaskHelp(root.tasks[parentArg], bot, args));
                break;
            }
            case 2: {
                helpText.push(stringifyTaskHelp(root.tasks[parentArg].tasks[childArg], bot, args));
                break;
            }
        }

        helpText.push(footer);
        return helpText.join('\n');
    }
}

function stringifyGroupHelp(taskGroup, args) {
    var strArray = [];
    strArray.push(`# ${taskGroup.name}:`);
    for (var task in taskGroup.tasks) {
        if (taskGroup.tasks[task] instanceof Task && args === undefined)
            strArray.push(": " + padString(task, 15) + taskGroup.tasks[task].desc);
        else if (taskGroup.tasks[task] instanceof Task)
            strArray.push(": " + `${padString(args + " " + task, 15)}` + taskGroup.tasks[task].desc);
    }
    for (var task in taskGroup.tasks) {
        if (taskGroup.tasks[task] instanceof TaskGroup) {
            strArray.push(`\n# ${taskGroup.tasks[task].name}:`)
            for (var innerTask in taskGroup.tasks[task].tasks) {
                strArray.push(": " + `${padString(task + " " + innerTask, 15)}` +
                taskGroup.tasks[task].tasks[innerTask].desc);
            }
        }
    }
    return strArray.join('\n');
}

function stringifyTaskHelp(task, bot, args) {
    var strArray = [];
    var name = args.join(' ');
    var usage = task.args.map(item => `<${item.name}>`).join(' ') || "";
    strArray.push(`# ${task.name}`);
    strArray.push(`- ${task.help}`);
    strArray.push(`\t${bot.prefix}${name} ${usage}`);
    strArray.push("- Arguments:");
    if (task.args.length > 0) {
        task.args.forEach(item => {
            if (item.optional)
                strArray.push(`\t= "${item.name}" ― (OPTIONAL) ${item.desc}`);
            else
                strArray.push(`\t= "${item.name}" ― ${item.desc}`);
        });
    }
    return strArray.join('\n');
}

function padString(string, padLength) {
    if (string.length > padLength) throw new Error('Invalid size.');
    var num = padLength - string.length;
    for (var i = 0; i < num; i++) {
        string += ' ';
    };
    return string;
};

module.exports = TaskHandler;