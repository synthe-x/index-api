const mongoose = require("mongoose");

const WithdrawSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    index:Number,
    account: String,
    asset: String,
    amount: Number,
},
{ timestamps: true }
);


module.exports = WithdrawSchema;