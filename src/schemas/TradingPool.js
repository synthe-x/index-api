const mongoose = require("mongoose");

const TradingPoolSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    pool_id : String,        
    pool_address : String,
    name: String,
    symbol: String,
    poolSynth_ids: [String],
},
{ timestamps: true }
);



module.exports = TradingPoolSchema;
