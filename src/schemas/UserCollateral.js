const mongoose = require("mongoose");

const UserCollateral = new mongoose.Schema({
   deposits: [String],
   withdraws : [String],
    collateral: String,
    balance : String,
    user_id : String,
    decimal : String,
    cAsset : String
},
{ timestamps: true }
);

module.exports = UserCollateral;
