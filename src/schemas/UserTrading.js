const mongoose = require("mongoose");

const UserTrading = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    tradePool: String,
    debtBalance: Number,
    position: Object
},
{ timestamps: true }
);

module.exports = UserTrading;
