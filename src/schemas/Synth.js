const mongoose = require("mongoose");

const SynthSchema = new mongoose.Schema({
    synth_id : String,
    name: String,
    symbol: String,
    price: String,
    oracle: String,
    borrowIndex: String,
    interestRateModel: String,
    accrualTimestamp: String,
    totalBorrowed: String,
    debtTracker_id : String,
    decimal :String,
    apy : String,
    liquidity : String

},
{ timestamps: true }
);

module.exports = SynthSchema;
