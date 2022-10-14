const mongoose = require("mongoose");

 const CollateralSchema = new mongoose.Schema({
    txn_id : String,
    coll_address : String,
    block_number : Number,
    block_timestamp : String,
    index : Number,
    name: String,
    symbol: String,
    price: String,
    oracle: String,
    decimal : String,
    minCollateral: Number,
    cAsset : String
},
{ timestamps: true }
);

module.exports = CollateralSchema;
