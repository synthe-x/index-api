const {handleNewCollateralAsset} = require('../../handlers/cManager');
const {handleNewSynthAsset} = require('../../handlers/dManager');
const {handleNewMinCRatio, handleNewSafeCRatio, handleDeposit, handleWithdraw, handleExchange, handleBorrow, handleRepay, handleLiquidate, handleSynthEnabledInTradingPool} = require('../../handlers/system');
const {handleNewTradingPool, handlePoolEntered, handlePoolExited} = require("../../handlers/tradingPool")

const {getAddress, getABI} = require("../../utils");

const SystemConfig = {
    contractAddress: getAddress("System"),
    abi: getABI("System"),
    handlers: {
        "NewSynthAsset": handleNewSynthAsset,
        "NewCollateralAsset": handleNewCollateralAsset,
        "NewTradingPool": handleNewTradingPool,
        "NewMinCRatio": handleNewMinCRatio,
        "NewSafeCRatio": handleNewSafeCRatio,
        "PoolEntered": handlePoolEntered,
        "PoolExited": handlePoolExited,
        "Liquidate": handleLiquidate,
        "Borrow": handleBorrow,
        "Repay": handleRepay,
        "Deposit": handleDeposit,
        "Withdraw": handleWithdraw,
        "Exchange": handleExchange,
        "SynthEnabledInTradingPool" : handleSynthEnabledInTradingPool
    }
}

module.exports = {SystemConfig};