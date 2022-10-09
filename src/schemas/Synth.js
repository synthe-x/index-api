const mongoose = require("mongoose");

export default SynthSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    borrowIndex: Number,
    interestRateModel: String,
});