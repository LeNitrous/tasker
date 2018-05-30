const Discord = require('discord.js');
const EnmapProvider = require('enmap-level');
const Enmap = require('enmap');
const Cron = require('cron');
const fs = require('fs');

const Handler = require('./Handler.js');
const Logger = require('./Logger.js');

/**
 * The bot class
 * @class Tasker
 * @extends {Discord.Client}
 * @param {Object} options Client configuration options
 * @param {String} options.tasks Bot's tasks (commands) directory in glob syntax
 * @param {String} options.prefix Bot's prefix to recognize commands
 * @param {String[]} options.ownerID Bot's owner mapped in a string array
 * @param {Number} options.timeout Cooldown before a user can use a command again
 */
class Tasker extends Discord.Client {
    constructor(options = {}) {
        super(options);

        this.token = options.token;
        this.prefix = options.prefix;
        this.ownerID = options.ownerID;
        this.taskDir = options.tasks;
        this.timeout = options.timeout;
        this.logFile = options.logFile;

        this.Settings = new Enmap({provider: new EnmapProvider({name: "settings"})});
        this.Handler = new Handler(this);
        this.Logger = new Logger(this.logFile);

        this.jobs = {};
        this.tasks = {};
        this.events = {};
        this.onTimeout = {};

        this
            .on("warn", w => this.Logger.warn(w))
            .on("disconnect", () => this.Logger.error("CLIENT DISCONNECTED", "WARN"))
            .on("reconnected", () => this.Logger.warn("CLIENT RECONNECTING"))
            .on("resume", () => this.Logger.info("CLIENT RECONNECTED"))
            .on("ready", () => {
                for (var job in this.jobs) {
                    this.jobs[job].start();
                }
                this.Logger.info("CLIENT CONNECTED");
            })
            .on("error", error => this.Logger.error(error.stack))
            .on("guildCreate", guild => {
                this.Logger.info(`Client joined ${guild.name} (ID: ${guild.id})`, "JOIN");
            })
            .on("guildDelete", guild => {
                this.Logger.warn(`Client left ${guild.name} (ID: ${guild.id})`, "LEFT");
            })
            .on("message", msg => {
                if (msg.author.bot) return;
                if (!msg.content.startsWith(this.prefix)) return;
                if (this.onTimeout.hasOwnProperty(msg.author.id)) {
                    var timeleft = Math.ceil((this.onTimeout[msg.author.id] - Date.now()) / 1000);
                    if (msg.guild)
                        msg.channel.send(`${msg.author.toString()}, please wait **${timeleft} seconds** for your next request.`);
                    else
                        msg.channel.send(`Please wait **${timeleft} seconds** for your next request.`);
                }
                else {
                    this.onTimeout[msg.author.id] = Date.now() + this.timeout * 1000;
                    setTimeout(() => {
                        delete this.onTimeout[msg.author.id];
                    }, this.timeout * 1000);
                    var query = msg.content.slice(this.prefix.length).split(" ");
                    this.Handler.getTask(query, this.tasks, this.prefix)
                        .then(task => {
                            if (!this.Handler.checkPermission(msg, this, task.load) && typeof task.load.task === "function") {
                                this.Logger.logCommand(msg.channel.guild === undefined ? null: msg.channel.guild.name, 
                                    msg.author.username, msg.content.slice(this.prefix.length), msg.channel.name);
                                return task;
                            }
                        })
                        .then(task => task.load.task(this, msg, task.args))
                        .catch(error => {
                            if (error != null) {
                                this.Logger.error(error.stack);
                            }
                            msg.channel.stopTyping(true);
                        });
                }
            });

        process
            .on("SIGINT", () => this.shutdown())
            .on("SIGUSR1", () => this.shutdown())
            .on("SIGUSR2", () => this.shutdown())
            .on("unhandledRejection", (reason, promise) => {
                if (reason.stack)
                    this.Logger.error(reason.stack);
                else
                    this.Logger.error(reason);
            })
            .on("uncaughtException", (error) => {
                this.Logger.error(error.stack);
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
            this.Handler.loadTasks(this.taskDir)
                .then(tasks => {
                    this.tasks = tasks;
                    this.login(this.token);
                    resolve(this);
                })
                .catch(error =>
                    this.Logger.error(error.stack)
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
            this.Handler.loadTasks(this.taskDir)
            .then(tasks => {
                this.tasks = tasks;
            })
            .catch(error =>
                this.Logger.error(error.stack)
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
        this.Logger.log("Loaded event module: " + event.event);
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
        this.Logger.log("Loaded job module: " + job.name);
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
            this.Logger.error(error.stack);
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
     * @param {User} user _OPTIONAL_ The user invoking the command as
     * @memberof Tasker
     */
    invoke(channel, query, user = this.user) {
        var msg = {
            channel: channel,
            guild: channel.guild,
            author: user,
            member: channel.guild.members.get(user.id)
        }
        this.Handler.getTask(query, this.tasks, this.prefix)
            .then(task => task.load.task(this, msg, task.args))
            .catch(error => {
                this.Logger.error(error.stack);
            });
    }

    /**
     * Gracefully shutdown the client
     * @memberof Tasker
     */
    shutdown() {
        this.Logger.warn("Shutting down");
        this.destroy()
            .then(() =>
                process.exit()
            )
            .catch(error => {
                this.Logger.error("An error has occured...\n");
                console.log(error);
            })
    }
}

module.exports = Tasker;