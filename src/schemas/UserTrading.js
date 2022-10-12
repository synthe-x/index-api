const mongoose = require("mongoose");

const UserTrading = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    pool_address: String,
    pool_id : String,
    user_id : String,
    amount: String,
    asset_id: String
},
{ timestamps: true }
);

module.exports = UserTrading;
