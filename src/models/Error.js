/**
 * Custom Error class for tasks
 * @class TaskError
 * @extends {Error}
 * @param {Object} error The error object
 */
class TaskError extends Error {
    constructor(error) {
        super("A task failed execution.\n" + error.stack);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom Error class for Events
 * @class EventError
 * @extends {Error}
 * @param {Object} error The error object
 */
class EventError extends Error {
    constructor(error, msg) {
        msg = "An event failed.\n" || msg + "\n";
        super(msg + error.stack);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom Error class for cronjobs
 * @class JobError
 * @extends {Error}
 * @param {Object} error The error object
 */
class JobError extends Error {
    constructor(error) {
        super("A cronjob failed.\n" + error.stack);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    job: JobError,
    task: TaskError,
    event: EventError,
};