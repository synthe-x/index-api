const {handleNewInterestRateModel, handleAccureInterest} = require("../../handlers/synth");

const {getABI, getAddress} = require("../../utils");


const DebtTrackerThruSystemConfig = () => {
    return{
        contractAddress: getAddress("System"),
        abi: getABI("DebtTracker"),
        handlers: {
            "AccureInterest": handleAccureInterest,
        }
    }
    
}

const DebtTrackerConfig = (contractAddress) => {
    return{
        contractAddress,
        abi: getABI("DebtTracker"),
        handlers: {
            "InterestRateModelUpdated": handleNewInterestRateModel,
        }
    }
    
}

module.exports = {DebtTrackerConfig, DebtTrackerThruSystemConfig};