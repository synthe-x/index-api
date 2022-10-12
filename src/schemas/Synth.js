const mongoose = require("mongoose");

const SynthSchema = new mongoose.Schema({
    synth_id : String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    borrowIndex: String,
    interestRateModel: String,
    accrualTimestamp: Number,
    totalBorrowed: Number,
    debtTracker_id : String

},
{ timestamps: true }
);

module.exports = SynthSchema;
