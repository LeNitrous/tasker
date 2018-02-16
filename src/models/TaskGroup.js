/** Task group class for task collections */
class TaskGroup {
    /**
     * Create a task group instance.
     * @param {Object} input Object to initialize the instance.
     * @param {String} input.name Task group display name.
     * @param {String} input.desc Task group help display text.
     * @param {String[]} input.preq Task group prerequisites to check before it is ran.
     * @param {String[]} input.perm Task group Discord permissions to check before it is ran.
     */
    constructor(input) {
        this.name = input.name || "";
        this.desc = input.desc || "";
        this.preq = input.preq || [];
        this.perm = input.perm || [];
        this.tasks = {};
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

}

module.exports = TaskGroup;