const Discord = require('discord.js');
const EnmapRethink = require('enmap-rethink');
const Enmap = require('enmap');
const Cron = require('cron');
const fs = require('fs');

const Handler = require('./Handler.js');
const Logger = require('./Logger.js');
const ExecError = require('./models/ErrorExecution.js');

/**
 * The bot class
 * @class Tasker
 * @extends {Discord.Client}
 * @param {Object} options Client configuration options
 * @param {String} options.tasks Bot's tasks (commands) directory in glob syntax
 * @param {String} options.prefix Bot's prefix to recognize commands
 * @param {Boolean} options.logError Bot logs most recent error.
 * @param {String[]} options.ownerID Bot's owner mapped in a string array
 */
class Tasker extends Discord.Client {
    constructor(options = {}) {
        super(options);

        this.token = options.token;
        this.prefix = options.prefix;
        this.ownerID = options.ownerID;
        this.taskDir = options.tasks;
        this.logError = options.logError || false;
        this.settings = new Enmap({provider: new EnmapRethink({name: "table"})});
        
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
            .on("error", error => {
                Logger.error(error);
                if (error instanceof ExecError && error.msg.channel) {
                    error.msg.channel.stopTyping(true);
                }
                if (this.logError) {
                    fs.writeFile("./error.log", "Last exception occured at " + new Date() + "\n" + error,
                        error => {
                            if (error) return Logger.error(error.stack);
                        });
                }
            })
            .on("message", msg => {
                if (msg.author.bot) return;
                if (!msg.content.startsWith(this.prefix)) return;
                var query = msg.content.slice(this.prefix.length).split(" ");
                this.handler.getTask(query, this.tasks, options.prefix)
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
                        this.throwError(msg, error);
                    });
            })

        process
            .on("SIGINT", () => this.shutdown())
            .on("SIGUSR1", () => this.shutdown())
            .on("SIGUSR2", () => this.shutdown())
            .on("unhandledRejection", (reason, promise) => {
                this.throwError("Unhandled Promise Rejection.", reason);
            })
            .on("uncaughtException", (error) => {
                this.throwError("Uncaught Exception.", error);
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
        this.events[event.name] = this.on(event.event, event.task);
        Logger.generic("Loaded event module: " + event.name);
    }

    /**
     * Remove a client event
     * @param {String} name 
     * @memberof Tasker
     */
    destroyEvent(name) {
        this.events[name] = undefined;
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
            this.jobs[job.name].do();
        }
        catch(error) {
            this.throwError(`A job error occured in "${this.jobs[job.name].name}".`, error);
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
     * @param {String} msg 
     * @param {Error} error 
     * @memberof Tasker
     */
    throwError(msg, error) {
        this.emit("error", new ExecError(error, msg));
    }
}

module.exports = Tasker;