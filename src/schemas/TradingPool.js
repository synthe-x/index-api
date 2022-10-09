const mongoose = require("mongoose");

export default TradingPoolSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    totalDebt: Number,
    totalSupply: String,
});