const mongoose = require("mongoose");

const liquidateSchema = new mongoose.Schema({
    txn_id : String,
    block_number : Number,
    block_timestamp : String,
    account: String,
    asset: String,
    pool : String,
    liquidator : String,
    amount: Number,
},
{ timestamps: true }
);
// event Liquidate(address pool, address liquidator, address account, address asset, uint amount);
module.exports = liquidateSchema;