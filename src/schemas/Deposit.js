const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    index:Number,
    account: String,
    asset: String,
    amount: String,
},
{ timestamps: true }
);

module.exports = DepositSchema;