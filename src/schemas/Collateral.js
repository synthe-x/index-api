const mongoose = require("mongoose");

 const CollateralSchema = new mongoose.Schema({
    txn_id : String,
    coll_address : String,
    block_number : Number,
    block_timestamp : String,
    index : Number,
    name: String,
    symbol: String,
    price: Number,
    oracle: String,
    minCollateral: Number,
},
{ timestamps: true }
);

module.exports = CollateralSchema;
