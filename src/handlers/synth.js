const { Synth } = require("../db");
const { tronWeb } = require("../utils");

function handleNewOracle(decodedData){

}

function handleNewInterestRateModel(decodedData){

}

async function handleAccureInterest(decodedData, arguments){
try{

    let debtTracker = tronWeb.address.fromHex(arguments.address);
    const findSynth = await Synth.findOne({debtTracker_id : debtTracker});
    const synth_id = findSynth._id.toString();

    const updateSynth = await Synth.findOneAndUpdate(
        {_id : synth_id},
        {$set:{accrualTimestamp : `${Number(decodedData.args[0])}`,
            totalBorrowed : `${Number(decodedData.args[1])}`,
            borrowIndex : `${Number(decodedData.args[2])}` 
        }},
        {new : true}
    );
}
catch(error){
    console.log("Error @ AccureInterest", error.message);
}

}

module.exports = {handleNewOracle, handleNewInterestRateModel, handleAccureInterest}

// synth_id : String,
// name: String,
// symbol: String,
// price: Number,
// oracle: String,
// borrowIndex: String,
// interestRateModel: String,
// accrualTimestamp: Number,
// totalBorrowed: Number,
// debtTracker_id : String