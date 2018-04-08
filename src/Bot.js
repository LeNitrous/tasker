const Discord = require('discord.js');
const EnmapProvider = require('enmap-level');
const Enmap = require('enmap');
const Cron = require('cron');
const fs = require('fs');

const Handler = require('./Handler.js');
const Logger = require('./Logger.js');
const Error = require('./models/Error.js');

/**
 * The bot class
 * @class Tasker
 * @extends {Discord.Client}
 * @param {Object} options Client configuration options
 * @param {String} options.tasks Bot's tasks (commands) directory in glob syntax
 * @param {String} options.prefix Bot's prefix to recognize commands
 * @param {String[]} options.ownerID Bot's owner mapped in a string array
 */
class Tasker extends Discord.Client {
    constructor(options = {}) {
        super(options);

        this.token = options.token;
        this.prefix = options.prefix;
        this.ownerID = options.ownerID;
        this.taskDir = options.tasks;
        this.settings = new Enmap({provider: new EnmapProvider({name: "settings"})});
        
        this.handler = new Handler(this);
        this.jobs = {};
        this.tasks = {};
        this.events = {};

        this
            .on("warn", w => Logger.warn(w))
            .on("disconnect", () => Logger.error("CLIENT DISCONNECTED", "WARN"))
            .on("reconnected", () => Logger.warn("CLIENT RECONNECTING"))
            .on("resume", () => Logger.info("CLIENT RECONNECTED"))
            .on("ready", () => {
                for (var job in this.jobs) {
                    this.jobs[job].start();
                }
                Logger.info("CLIENT CONNECTED");
            })
            .on("error", error => Logger.error(error))
            .on("message", msg => {
                if (msg.author.bot) return;
                if (!msg.content.startsWith(this.prefix)) return;
                var query = msg.content.slice(this.prefix.length).split(" ");
                this.handler.getTask(query, this.tasks, this.prefix)
                    .then(task => {
                        if (this.handler.checkPermission(msg, this, task.load))
                            return;
                        if (typeof task.load.task !== "function")
                            return Logger.warn("Loaded task has no action!");
                        msg.channel.startTyping();
                        Logger.logCommand(msg.channel.guild === undefined ? null: msg.channel.guild.name, 
                            msg.author.username, msg.content.slice(this.prefix.length), msg.channel.name);
                        task.load.task(this, msg, task.args);
                        msg.channel.stopTyping(true);
                    })
                    .catch(error => {
                        msg.channel.stopTyping(true);
                        this.throwError("task", error);
                    });
            });

        process
            .on("SIGINT", () => this.shutdown())
            .on("SIGUSR1", () => this.shutdown())
            .on("SIGUSR2", () => this.shutdown())
            .on("unhandledRejection", (reason, promise) => {
                this.throwError("event", reason, "Caught an unhandled promise rejection.");
            })
            .on("uncaughtException", (error) => {
                this.throwError("event", error, "Caught an uncaught exception.");
                this.shutdown();
            });
    }

    /**
     * Starts and runs the bot
     * @returns {Promise}
     * @memberof Tasker
     */
    start() {
        return new Promise((resolve, reject) => {
            this.handler.loadTasks(this.taskDir)
                .then(tasks => {
                    this.tasks = tasks;
                    this.login(this.token);
                    resolve(this);
                })
                .catch(error =>
                    Logger.error(error.stack)
                )
        })
    }

    /**
     * Reloads all loaded tasks
     * @returns {Promise}
     * @memberof Tasker
     */
    reloadTasks() {
        return new Promise((resolve, reject) => {
            this.handler.loadTasks(this.taskDir)
            .then(tasks => {
                this.tasks = tasks;
            })
            .catch(error =>
                Logger.error(error.stack)
            )
        })
    }

    /**
     * Load a client event
     * @param {Object} event 
     * @memberof Tasker
     */
    loadEvent(event) {
        this.events[event.event] = this.on(event.event, event.task);
        Logger.generic("Loaded event module: " + event.event);
    }

    /**
     * Remove a client event
     * @param {String} event 
     * @memberof Tasker
     */
    destroyEvent(event) {
        this.events[event] = undefined;
    }

    /**
     * Load a client cron job
     * @param {Object} job 
     * @memberof Tasker
     */
    loadJob(job) {
        this.jobs[job.name] = new Cron.CronJob({
            cronTime: job.time,
            timeZone: job.timezone,
            start: false,
            onTick: () => {
                this.doJob(this.jobs[job.name].name);
            }
        });
        this.jobs[job.name].name = job.name;
        this.jobs[job.name].do = job.task.bind(null, this);
        Logger.generic("Loaded job module: " + job.name);
    }

    /**
     * Force run a cron job
     * @param {String} name
     * @memberof Tasker
     */
    doJob(name) {
        try {
            this.jobs[name].do();
        }
        catch(error) {
            this.throwError("job", error);
        }
    }

    /**
     * Remove a client cron job
     * @param {String} name 
     * @memberof Tasker
     */
    destroyJob(name) {
        this.jobs[name] = undefined;
    }

    /**
     * Perform a command with highest privelleges. Contains a fake Message Object.
     * The fake Message Object only contains channel, guild, author, and member data
     * with the latter two being the bot client itself.
     * 
     * **Not all commands will work!**
     * @param {Channel} channel Discord Channel to invoke the command
     * @param {String[]} query Command in string array as if ran by a user
     * @memberof Tasker
     */
    invoke(channel, query) {
        var msg = {
            channel: channel,
            guild: channel.guild,
            author: Kokoro.user,
            member: channel.guild.members.get(Kokoro.user.id)
        }
        this.handler.getTask(query, this.tasks, this.prefix)
            .then(task => {
                msg.channel.startTyping();
                task.load.task(this, msg, task.args);
                msg.channel.stopTyping(true);
            })
            .catch(error => {
                this.throwError("task", error);
            });
    }

    /**
     * Gracefully shutdown the client
     * @memberof Tasker
     */
    shutdown() {
        Logger.warn("Shutting down");
        this.destroy()
            .then(() =>
                process.exit()
            )
            .catch(error => {
                Logger.error("An error has occured...\n");
                console.log(e);
            })
    }

    /**
     * Emit an error event passing error arguments
     * @param {String} type
     * @param {Error} error 
     * @memberof Tasker
     */
    throwError(type, error) {
        this.emit("error", new Error[type](error));
    }
}

module.exports = Tasker;