const {SystemConfig} = require("./sync/configs/system");
const {syncAndListen} = require("./sync/sync");

syncAndListen(SystemConfig)
