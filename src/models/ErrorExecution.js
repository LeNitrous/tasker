/**
 * Custom Error class for tasks
 * @class TaskExecutionError
 * @extends {Error}
 * @param {Object} error The error object
 * @param {Object} msg The Discord message object
 */
class TaskExecutionError extends Error {
    constructor(error, msg) {
        super("A task failed execution.\n" + error.stack);
        this.name = this.constructor.name;
        this.msg = msg;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = TaskExecutionError;