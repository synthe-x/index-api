const mongoose = require("mongoose");

const TradingPoolSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    pool_id : String,        
    pool_address : String,
    name: String,
    symbol: String,
    Debt: [String],
},
{ timestamps: true }
);

// const PoolDebt = new mongoose.Schema({
//     pool: String,
//     asset: String,
//     balance: String
// })

module.exports = TradingPoolSchema;
