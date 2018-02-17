const Discord = require('discord.js');
const Cron = require('cron');
const fs = require('fs');
const Handler = require('./Handler.js');
const Logger = require('./Logger.js');
const ExecError = require('./models/ErrorExecution.js');

/**
 * The bot class
 * @class Kokoro
 * @extends {Discord.Client}
 * @param {Object} options Client configuration options
 * @param {String} options.tasks Bot's tasks (commands) directory in glob syntax
 * @param {String} options.prefix Bot's prefix to recognize commands
 * @param {Boolean} options.peaceful Bot's behavior toward permission checks
 * @param {Boolean} options.logError Bot logs most recent error.
 * @param {String[]} options.ownerID Bot's owner mapped in a string array
 */
class Kokoro extends Discord.Client {
    constructor(options = {}) {
        super(options);
        
        this.token = options.token;
        this.prefix = options.prefix;
        this.ownerID = options.ownerID;
        this.taskDir = options.tasks;
        this.logError = options.logError || false;
        this.peaceful = options.peaceful || false;
        
        this.handler = new Handler(this);
        this.error = ExecError;
        this.jobs = {};
        this.tasks = {};
        this.events = {};

        this
            .on("warn", w => Logger.warn(w))
            .on("disconnect", () => Logger.error("CLIENT DISCONNECTED", "WARN"))
            .on("reconnected", () => Logger.warn("CLIENT RECONNECTING"))
            .on("resume", () => Logger.info("CLIENT RECONNECTED"))
            .on("ready", () => {
                Logger.info("CLIENT CONNECTED");
                for (var job in this.jobs) {
                    this.jobs[job].start();
                }
            })
            .on("error", error => {
                var log;
                if (error instanceof this.error) {
                    this.send(error.msg.channel, "💢", "Oops! That wasn't supposed to happen.")
                    error.msg.channel.stopTyping(true);
                    log = `An error occured in "${error.detail.source}" where:\n` + error.detail.stack;
                    Logger.error(log);
                }
                else {
                    log = "An error occured somehow where:\n" + error.stack;
                    Logger.error(log);
                }
                if (!this.logError) return;
                fs.writeFile("./error.log", "Last exception occured at " + new Date() + "\n" + log,
                    error => {
                        if (error) return Logger.error(error.stack);
                    });
            })
            .on("message", msg => {
                if (msg.author.bot) return;
                if (!msg.content.startsWith(this.prefix)) return;
                var query = msg.content.slice(this.prefix.length).split(" ");
                this.handler.getTask(query, this.tasks, options.prefix)
                    .then(task => {
                        if (this.handler.checkPermission(msg, this, task.load))
                            return this.send(msg.channel, "⛔", "You have no permission do this task.");
                        if (!task.load.task)
                            return Logger.warn("Loaded task has no action!");
                        msg.channel.startTyping();
                        Logger.logCommand(msg.channel.guild === undefined ? null: msg.channel.guild.name, 
                            msg.author.username, msg.content.slice(this.prefix.length), msg.channel.name);
                        task.load.task(this, msg, task.args);
                        msg.channel.stopTyping(true);
                    })
                    .catch(error => {
                        this.emit("error", error);
                    });
            })

            process
                .on("SIGINT", () => this.shutdown())
                .on("SIGUSR1", () => this.shutdown())
                .on("SIGUSR2", () => this.shutdown());
    }

    send(channel, icon, content) {
        return channel.send(`${icon} » ${content}`);
    }

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

    loadEvent(event) {
        this.events[event.name] = this.on(event.event, event.task);
        Logger.generic("Loaded event module: " + event.name);
    }

    destroyEvent(event) {
        this.events[event.name] = undefined;
    }

    loadJob(job) {
        this.jobs[job.name] = new Cron.CronJob({
            cronTime: job.time,
            timeZone: job.timezone,
            start: false,
            onTick: job.task.bind(null, this)
        });
        Logger.generic("Loaded job module: " + job.name);
    }

    destroyJob(job) {
        this.jobs[job.name] = undefined;
    }

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
}

module.exports = Kokoro;