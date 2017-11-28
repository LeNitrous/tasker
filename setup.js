const Logger = require('./modules/Logger.js');
const fs = require('fs');

const DirCommands = './commands';
const DirConfig = './config.json';
const DirData = './data';

const DefaultConfig = {
    token: "",
    owner: [],
    prefix: "]",
    peaceful: false,
    reply: {
        PermsServer: "⚠️ » This command is only available in guilds.",
        PermsDMChat: "⚠️ » This command is only available in direct messages.",
        PermsBotOwner: "🚫 » You don't have permission to use this command.",
        PermsElevatedPerms: "🚫 » You don't have permission to use this command.",
        PermsServerOwner: "🚫 » You don't have permission to use this command.",
        SysError: "💢 » An error has occured!\n```{0}```",
        SysReload: "🔁 » Reloaded `{0}` successfully.",
        SysReloadNotFound: "⚠️ » `{0}` doesn't exist",
        SysStatusBusy: "Reloading!",
        SysWarn: "⚠️ » ",
        SysDisallow: "🚫 » ",
        SysYes: "⭕️ » ",
        SysNo: "❌ » "
    }
};

module.exports = {
    init() {
        var SafeToStart = true;
    
        if (!fs.existsSync(DirCommands)) {
            Logger.warn('Commands directory doesn\'t exist! Creating one...')
            fs.mkdirSync(DirCommands);
        };
        if (!fs.existsSync(DirData)) {
            logger.warn('Data directory doesn\'t exist! Creating one...');
            fs.mkdirSync(DirData);         
        };
        if (!fs.existsSync(DirConfig)) {
            Logger.warn('Config file doesn\'t exist! Creating one...');
            fs.writeFileSync(DirConfig, JSON.stringify(DefaultConfig));
        };
    
        var Config = require(DirConfig);
    
        if (Config.token.length == 0) {
            Logger.error('Token has not been set! Please set one in your configuration file.\nYou can find your token in: https://discordapp.com/developers/applications/me');
            SafeToStart = false;
        };
            
    
        if (Config.owner.length == 0) {
            Logger.error('No owner id has been set! You will not be able to access owner-only commands. Please set one in your configuration file');
            SafeToStart = false;
        };
            
        if (!SafeToStart) process.exit();
    }
};