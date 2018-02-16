/** Task class for bot actions */

class Task {
    /**
     * Create a task instance.
     * @param {Object} input Object to initialize the instance.
     * @param {String} input.name Task display name.
     * @param {String} input.desc Task help display text.
     * @param {String} input.help Task help full text.
     * @param {String[]} input.preq Task prerequisites to check before it is ran.
     * @param {String[]} input.perm Task Discord permissions to check before it is ran.
     * @param {Object[]} input.args Task help arguments display.
     * @param {String} input.args[].name Argument property name.
     * @param {String} input.args[].desc Argument property description.
     * @param {Boolean} input.args[].optional Argument property requirement.
     * @param {Function} input.task Task method to invoke when called.
     */
    constructor(input) {
        this.name = input.name || "";
        this.desc = input.desc || "";
        this.help = input.help || "";
        this.preq = input.preq || [];
        this.perm = input.perm || [];
        this.args = input.args || [];
        this.task = input.task;
    }

    /** 
     * Get instance name.
     * @return {String} The instance name.
    */
    getName() {
        return this.name;
    }

    /** 
     * Get instance description.
     * @return {String} The instance description.
    */
    getDescription() {
        return this.desc;
    }

    /** 
     * Get instance help text.
     * @return {String} The instance help text.
    */
    getHelp() {
        return this.help;
    }

    /**
     * Get instance prerequisites.
     * @return {String[]} The instance prerequsites.
     */
    getPrerequisites() {
        return this.preq;
    }

    /**
     * Get instance permissions.
     * @return {String[]} The instance permissions.
     */
    getPermissions() {
        return this.perm;
    }

    /**
     * Invoke instance method.
    */
    runTask() {
        this.task();
    }

}

module.exports = Task;