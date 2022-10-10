const {System} = require("../db");

async function handleNewMinCRatio(decodedData){
    // get system
    // update mincratio
    // save system
}

function handleNewSafeCRatio(decodedData){
    // get system
    // update safecratio
    // save system
}

function handleExchange(decodedData){
    // ...
}

function handleBorrow(decodedData) {

}

function handleRepay(decodedData) {

}

function handleDeposit(decodedData) {

}

function handleWithdraw(decodedData) {
    // get user
    
}

function handleLiquidate(decodedData) {

}

module.exports = {handleNewMinCRatio, handleNewSafeCRatio, handleExchange, handleLiquidate, handleBorrow, handleRepay, handleDeposit, handleWithdraw}
