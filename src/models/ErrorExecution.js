class ExecutionError extends Error {
    constructor(message, mod) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

        this.source = mod.name;
    }
}

module.exports = ExecutionError;