const mongoose = require("mongoose");

const TradingPoolSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    name: String,
    symbol: String,
    totalDebt: Number,
    totalSupply: String,
},
{ timestamps: true }
);

module.exports = TradingPoolSchema;
