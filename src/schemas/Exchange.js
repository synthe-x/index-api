const mongoose = require("mongoose");

const ExchangeSchema = new mongoose.Schema({
    user_id : String,
    pool_id: String,
    src : String,
    src_amount : String,
    dst : String,
    dst_amount : String,
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    index:Number  
},
{ timestamps: true }
);

module.exports = ExchangeSchema;