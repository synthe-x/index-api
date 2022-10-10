const {handleNewInterestRateModel, handleAccureInterest} = require("../../handlers/synth");

const {getABI} = require("../../utils");


const DebtTrackerConfig = (contractAddress) => {
    return{
        contractAddress,
        abi: getABI("DebtTracker"),
        handlers: {
            "AccureInterest": handleAccureInterest,
            "InterestRateModelUpdated": handleNewInterestRateModel,
        }
    }
    
}

module.exports = {DebtTrackerConfig};