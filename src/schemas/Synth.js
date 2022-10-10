const mongoose = require("mongoose");

const SynthSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    borrowIndex: Number,
    interestRateModel: String,
});

module.exports = SynthSchema;