const {ContractTransaction} = require("./tron-web");

function getCon(addr, abi){
    ContractTransaction(addr, abi)
}

module.exports = {getCon}