const mongoose = require("mongoose");

const UserCollateral = new mongoose.Schema({
   deposits: [String],
   withdraws : [String],
    collateral: String,
    balance : Number,
    user_id : String,
},
{ timestamps: true }
);

module.exports = UserCollateral;
