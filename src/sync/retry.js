const {syncAndListen} = require("./sync");

function retry({contractAddress, abi, handlers}) {
    syncAndListen({contractAddress, abi, handlers})
}

module.exports = {retry}