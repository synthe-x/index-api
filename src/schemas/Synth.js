const mongoose = require("mongoose");

const SynthSchema = new mongoose.Schema({
    synth_id : String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    borrowIndex: Number,
    interestRateModel: String,
},
{ timestamps: true }
);

module.exports = SynthSchema;
