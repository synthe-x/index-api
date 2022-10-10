const mongoose = require("mongoose");

const TradingPoolSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    totalDebt: Number,
    totalSupply: String,
});

module.exports = TradingPoolSchema;