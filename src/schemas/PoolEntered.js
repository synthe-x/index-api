const mongoose = require("mongoose");

const poolEnteredSchema = new mongoose.Schema({
    user_id : String,
    pool_address: String,
    pool_id : String,
    asset_id : String,
    amount : String,
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    index:Number  
},
{ timestamps: true }
);

module.exports = poolEnteredSchema;