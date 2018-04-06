/**
 * Custom Error class for tasks
 * @class TaskExecutionError
 * @extends {Error}
 * @param {Object} error The error object
 */
class TaskExecutionError extends Error {
    constructor(error) {
        super("A task failed execution.\n" + error.stack);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = TaskExecutionError;